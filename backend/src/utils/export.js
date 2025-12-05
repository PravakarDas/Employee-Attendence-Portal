const ExcelJS = require('exceljs');
const Attendance = require('../models/Attendance');

// Convert attendance data to CSV format
const exportToCSV = async (attendanceData) => {
  try {
    // Format data for CSV
    const formattedData = attendanceData.map(record => ({
      'Employee Name': record.employee_id?.name || 'Unknown',
      'Employee Email': record.employee_id?.email || 'Unknown',
      'Department': record.employee_id?.department || 'Unknown',
      'Date': new Date(record.date).toLocaleDateString(),
      'Check In': new Date(record.check_in).toLocaleString(),
      'Check Out': record.check_out ? new Date(record.check_out).toLocaleString() : 'Not checked out',
      'Total Hours': record.total_hours ? record.total_hours.toFixed(2) : '0.00',
      'Status': record.status || 'active'
    }));

    // Create CSV manually
    const headers = Object.keys(formattedData[0] || {});
    const csvContent = [
      headers.join(','),
      ...formattedData.map(row =>
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to export data to CSV');
  }
};

// Convert attendance data to Excel format
const exportToExcel = async (attendanceData) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Records');

    // Add headers
    worksheet.columns = [
      { header: 'Employee Name', key: 'employeeName', width: 20 },
      { header: 'Employee Email', key: 'employeeEmail', width: 25 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Check In', key: 'checkIn', width: 20 },
      { header: 'Check Out', key: 'checkOut', width: 20 },
      { header: 'Total Hours', key: 'totalHours', width: 12 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    attendanceData.forEach(record => {
      worksheet.addRow({
        employeeName: record.employee_id?.name || 'Unknown',
        employeeEmail: record.employee_id?.email || 'Unknown',
        department: record.employee_id?.department || 'Unknown',
        date: new Date(record.date).toLocaleDateString(),
        checkIn: new Date(record.check_in).toLocaleString(),
        checkOut: record.check_out ? new Date(record.check_out).toLocaleString() : 'Not checked out',
        totalHours: record.total_hours ? record.total_hours.toFixed(2) : '0.00',
        status: record.status || 'active'
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(column.width, 10);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error('Failed to export data to Excel');
  }
};

// Get attendance data for export with filters
const getAttendanceDataForExport = async (filters = {}) => {
  try {
    const { startDate, endDate, employeeId, department } = filters;

    // Build query
    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (employeeId) {
      query.employee_id = employeeId;
    }

    // Get attendance records
    let attendanceQuery = Attendance.find(query)
      .populate('employee_id', 'name email department role')
      .sort({ check_in: -1 });

    // If department filter is specified, we need to filter after population
    let attendance = await attendanceQuery;

    if (department) {
      attendance = attendance.filter(record =>
        record.employee_id?.department === department
      );
    }

    return attendance;
  } catch (error) {
    console.error('Get attendance data error:', error);
    throw new Error('Failed to retrieve attendance data for export');
  }
};

// Generate summary report data
const generateSummaryReport = async (filters = {}) => {
  try {
    const { startDate, endDate, employeeId, department } = filters;

    // Build match stage
    let matchStage = {};

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    if (employeeId) {
      matchStage.employee_id = require('mongoose').Types.ObjectId(employeeId);
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ];

    // Add department filter if specified
    if (department) {
      pipeline.push({ $match: { 'employee.department': department } });
    }

    // Group by employee
    pipeline.push({
      $group: {
        _id: '$employee_id',
        employee: { $first: '$employee' },
        totalCheckIns: { $sum: 1 },
        totalCheckOuts: { $sum: { $cond: [{ $ne: ['$check_out', null] }, 1, 0] } },
        totalHours: { $sum: '$total_hours' },
        averageHoursPerDay: { $avg: '$total_hours' },
        presentDays: {
          $sum: { $cond: [{ $ne: ['$check_out', null] }, 1, 0] }
        }
      }
    });

    // Project final fields
    pipeline.push({
      $project: {
        employeeName: '$employee.name',
        employeeEmail: '$employee.email',
        department: '$employee.department',
        role: '$employee.role',
        totalCheckIns: 1,
        totalCheckOuts: 1,
        totalHours: { $round: ['$totalHours', 2] },
        averageHoursPerDay: { $round: ['$averageHoursPerDay', 2] },
        presentDays: 1
      }
    });

    const summary = await Attendance.aggregate(pipeline);

    return summary;
  } catch (error) {
    console.error('Generate summary report error:', error);
    throw new Error('Failed to generate summary report');
  }
};

module.exports = {
  exportToCSV,
  exportToExcel,
  getAttendanceDataForExport,
  generateSummaryReport
};