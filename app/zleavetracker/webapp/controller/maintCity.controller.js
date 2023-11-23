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
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/ui/core/BusyIndicator'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Fragment, DateFormat, coreLibrary, Label, Popover, Log, exportLibrary, Spreadsheet, Filter, FilterOperator, PersonalizableInfo, BusyIndicator) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("com.sap.zleavetracker.controller.maintCity", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
            },
            addSkill: function () {
            },
            //EDIT TEAM SKILL
            editSkill: function () {
                var oView = this.getView();
                var oSelected = this.byId("tableCity").getSelectedItem(),
                    oBinding = this.byId("tableCity").getBinding("items"),
                    oModel = oBinding.getModel();
                if (oSelected) {
                    var oEditContext = oSelected.getBindingContext();
                    if (!this.editDialogCont) {
                        this.editDialogCont = Fragment.load({ id: oView.getId(), name: "com.sap.zleavetracker.fragment.editCountry", controller: this }).then(function (oDialog) {
                            oView.addDependent(oDialog);
                            return oDialog;
                        });
                    }
                }
                this.editDialogCont.then(function (oDialog) {
                    oDialog.setBindingContext(oEditContext);
                    oDialog.setModel(oModel);
                    oDialog.open();
                })
            },
            handleSaveBtnPressTS: function () {
                var fnSuccess = function () {
                    MessageBox.show("Change Successful.");
                    this.handleCloseTS();
                }.bind(this);
                var fnError = function (oError) {
                    MessageBox.error(oError.message);
                    this.handleCloseTS();
                }.bind(this);
                this.getView().getModel().submitBatch("countryGroup").then(fnSuccess, fnError);
            },
            handleCloseTS: function () {
                this.editDialogCont.then(function (oDialog) {
                    oDialog.close();
                })
            },
            handleCancelBtnPressTS: function () {
                this.byId("tableCity").getBinding("items").resetChanges();
                this.handleCloseTS();
            },
            //ADD TEAM SKILL
            openManageCityFrag: function () {
                // MessageBox.error('good')
                var oView = this.getView();
                if (!this.ManageCityFrag) {
                    this.ManageCityFrag = Fragment.load({ id: oView.getId(), name: "com.sap.zleavetracker.fragment.manageCity", controller: this }).then(function (manageCity) {
                        oView.addDependent(manageCity);
                        return manageCity;
                    });
                }
                this.ManageCityFrag.then(function (manageCity) {
                    manageCity.open();
                }.bind(this));
            },
            closeManageCityFrag: function () {
                this.ManageCityFrag.then(function (manageCity) {
                    BusyIndicator.hide()
                    manageCity.close();
                });
            },
            saveManageCityFrag: function () {
                BusyIndicator.show(0)
                var that = this;
                var cityName = this.byId('cityinp').getValue(),
                    CountryID = this.byId('cbcityy').getSelectedKey(),
                    contNAME = this.byId('cbcityy').getSelectedItem().getText(),
                    data = {
                        "countryID": CountryID,
                        "country": contNAME,
                        "city": cityName
                    };
                $.ajax({
                    url: "/leaveApi/CountryCity",
                    type: "POST",
                    data: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (res) {
                        that.closeManageCityFrag();
                        MessageBox.success('City name "' + res.city + '" is added.');
                        that.refreshTable()
                    },
                    error: function (error) {
                        that.closeManageCityFrag();
                        MessageBox.error('Country name not added.')
                        that.refreshTable()
                    }
                });
                this.byId('countryName').setValue('');
                this.byId('countryID').setValue();
            },
            //to refresh table data
            refreshTable: function () {
                this.byId("tableCity").getBinding("items").refresh();
            },
            //Delete team skill
            deleteSkill: function () {
                // MessageBox.warning("You want to delete.")
                var that = this;
                var pathLeave = this.byId("tableCity").getSelectedItem().getBindingContext().getPath();
                
                $.ajax({
                    url: "/leaveApi" + pathLeave,
                    type: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (data) {
                        MessageBox.success("success")
                        that.refreshTable()
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
            },
            onButtonNavigationBack: function () {
                this.oRouter.navTo("Routemain");
            },
            createColumnConfig: function () {
                var aCols = [];
                aCols.push({
                    label: 'Team Name',
                    property: 'teamName',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Description',
                    type: EdmType.String,
                    property: 'description',
                    scale: 0
                });
                return aCols;
            },
            teamskillExport: function () {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
                if (!this._oTable) {
                    this._oTable = this.byId('tableCity');
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
                    fileName: 'Team Skill Data.xlsx',
                    worker: false // We need to disable worker because we are using a MockServer as OData Service
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

        })
    });