sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/core/Fragment',
    'sap/ui/core/format/DateFormat',
    'sap/ui/core/library',
    'sap/m/Label',
    'sap/m/Popover',
    'sap/base/Log',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Fragment, DateFormat, coreLibrary, Label, Popover, Log, exportLibrary, Spreadsheet, Filter, FilterOperator, PersonalizableInfo) {
        "use strict";

        var EdmType = exportLibrary.EdmType;

        return Controller.extend("com.sap.zleavetracker.controller.report", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                var that = this;
                // var odata = {
                //     "startDate": new Date()
                // }
                // var oModel = new JSONModel();
                // oModel.setData(odata)
                // this.getView().setModel(oModel, 'localModel')
                $.ajax({
                    url: '/catalog/Employees',
                    type: "GET",
                    success: function (data) {
                        var x = data.value;
                        var oModel = new JSONModel();
                        oModel.setData(x)
                        that.getView().setModel(oModel, 'empModel')
                        console.log(x);
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
                this.applyData = this.applyData.bind(this);
                this.fetchData = this.fetchData.bind(this);
                this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

                // this.oSmartVariantManagement = this.getView().byId("svm");
                this.oExpandedLabel = this.getView().byId("expandedLabel");
                this.oSnappedLabel = this.getView().byId("snappedLabel");
                this.oFilterBar = this.getView().byId("filterbar");
                this.oTable = this.getView().byId("table");

                this.oFilterBar.registerFetchData(this.fetchData);
                this.oFilterBar.registerApplyData(this.applyData);
                this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

                var oPersInfo = new PersonalizableInfo({
                    type: "filterBar",
                    keyName: "persistencyKey",
                    dataSource: "",
                    control: this.oFilterBar
                });
                // this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
                // this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

            },
            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },
            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();

                    if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }

                    return aResult;
                }, []);

                return aFiltersWithValue;
            },
            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });

                    return aResult;
                }, []);

                return aData;
            },
            onAfterVariantLoad: function () {
                this._updateLabelsAndTable();
            },
            _updateLabelsAndTable: function () {
                this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
                this.oSnappedLabel.setText(this.getFormattedSummaryText());
                this.oTable.setShowOverlay(true);
            },
            onSelectionChange: function (oEvent) {
                // this.oSmartVariantManagement.currentVariantSetModified(true);
                this.oFilterBar.fireFilterChange(oEvent);
            },
            onSearch: function () {
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKeys(),
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: 'employeeID',
                                operator: FilterOperator.EQ,
                                value1: sSelectedKey
                            });
                        });

                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }

                    return aResult;
                }, []);

                this.oTable.getBinding("items").filter(aTableFilters);
                this.oTable.setShowOverlay(false);
            },
            createColumnConfig: function () {
                var aCols = [];

                aCols.push({
                    label: 'Leave ID',
                    property: 'empLeaveID',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Employee ID',
                    type: EdmType.String,
                    property: 'employeeID',
                    scale: 0
                });

                aCols.push({
                    label: 'Start Date',
                    property: 'startDate',
                    type: EdmType.String,
                    scale: 0
                });

                aCols.push({
                    label: 'End Date',
                    property: 'endDate',
                    type: EdmType.String,
                    scale: 0
                });

                aCols.push({
                    label: 'Title',
                    property: 'title',
                    type: EdmType.String,
                    scale: 0
                });

                aCols.push({
                    label: 'Description',
                    property: 'description',
                    type: EdmType.String,
                    scale: 0
                });

                return aCols;
            }, employeeLeaveExport: function () {
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('table');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Leave Data.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            onButtonNavigationBack: function () {
                this.oRouter.navTo("Routemain");
            }

        })
    });