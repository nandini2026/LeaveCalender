namespace ppg.leavetracker;

using {managed} from '@sap/cds/common';

entity Employees : managed {
    key employeeID    : UUID;
        employeeName  : String;
        team          : Association to one Teams;
        location      : String;
        pic           : String;
        publicHoliday : Association to many PublicHolidays
                            on publicHoliday.location = location;
        leave         : Association to many EmployeeLeaves
                            on leave.employeeID = employeeID;
}

entity Teams : managed {
    key teamName    : String;
        description : String;
        employee    : Association to many Employees
                          on employee.team = $self;
}

entity PublicHolidays : managed {
    key puHoliID    : Integer;
        location    : String;
        startDate   : DateTime;
        endDate     : DateTime;
        description : String;
        pic         : String;
        type        : String;
        employee    : Association to one Employees;
}

entity EmployeeLeaves {
        // key empLeaveID : Integer;
    key empLeaveID  : UUID;
        employeeID  : UUID; //changed from integer to UUID
        startDate   : DateTime;
        endDate     : DateTime;
        title       : String;
        description : String;
        type        : String;
        employee    : Association to one Employees;
}

entity legendItems {
    key ID    : Integer;
        text  : String;
        type  : String;
        color : String;
}

entity legendAppointmentItems {
    key ID   : Integer;
        text : String;
        type : String;
}

entity CountryCity {
    key countryCityID : UUID;
        countryID     : UUID;
        country       : String;
        city          : String;
        count         : Association to one Country;
}

entity Country {
    key countryID : UUID;
        country   : String;
        city      : Association to many CountryCity
                        on city.countryID = countryID;
}
