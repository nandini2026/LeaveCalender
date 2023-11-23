using ppg.leavetracker as myppgleave from '../db/data-model';

// @path : 'leaveApi'
service CatalogService  @(path : '/leaveApi')  {
     
  entity Employees      as projection on myppgleave.Employees;

//   entity Employees as projection on myppgleave.Employees actions {
//         //@cds.odata.bindingparameter.collection
//         action refreshData() returns Boolean;
//     };


  entity Teams          as projection on myppgleave.Teams;
  entity PublicHolidays as projection on myppgleave.PublicHolidays;
  @Capabilities : { Readable,Insertable,Updatable,Deletable }
  entity Leaves         as projection on myppgleave.EmployeeLeaves;
  entity legendItems    as projection on myppgleave.legendItems;
  entity CountryCity    as projection on myppgleave.CountryCity;
  entity Country    as projection on myppgleave.Country;
}

annotate CatalogService.Country with @(UI: {
    LineItem       : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: countryID,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Name',
            Value: country
        },
    ],
    SelectionFields: [
        country,
        countryID
    ],
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Country',
        TypeNamePlural: 'Countries',
        Description   : {
            $Type: 'UI.DataField',
            Value: country,
        },
        Title         : {
            $Type: 'UI.DataField',
            Value: countryID,
        },
    }
});

annotate CatalogService.PublicHolidays with @(UI: {
    LineItem       : [
        {
            $Type: 'UI.DataField',
            Label: 'ID',
            Value: puHoliID,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Start Date',
            Value: startDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'End Date',
            Value: endDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Description',
            Value: description
        },
        {
            $Type: 'UI.DataField',
            Label: 'Location',
            Value: location
        },
    ],
    SelectionFields: [
        puHoliID,
        startDate,
        endDate,
        type,
        location
    ],
    HeaderInfo     : {
        $Type         : 'UI.HeaderInfoType',
        TypeName      : 'Employee',
        TypeNamePlural: 'Employees',
        Description   : {
            $Type: 'UI.DataField',
            Value: location,
        },
        Title         : {
            $Type: 'UI.DataField',
            Value: description,
        },
    }
});