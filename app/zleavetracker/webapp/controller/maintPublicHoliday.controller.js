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
        return Controller.extend("com.sap.zleavetracker.controller.maintPublicHoliday", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.byId('comboLoc').setValue('');
                // this.byId('tablePublicHoliday').unbindItems()
            },
            cityChangeEvent:function(oEvent){
                var selectedval = oEvent.getSource().getValue();
                var aFilter = new sap.ui.model.Filter( "location", sap.ui.model.FilterOperator.Contains, selectedval) ;
                this.byId('tablePublicHoliday').getBinding("items").filter([aFilter]);
            },
            addSkill: function () {
            },
            //EDIT TEAM SKILL
            editSkill: function () {
                // var oView = this.getView();
                // var oSelected = this.byId("tableCountry").getSelectedItem(),
                //     oBinding = this.byId("tableCountry").getBinding("items"),
                //     oModel = oBinding.getModel();
                // if (oSelected) {
                //     var oEditContext = oSelected.getBindingContext();
                //     if (!this.editDialog) {
                //         this.editDialog = Fragment.load({ id: oView.getId(), name: "zleavetracker.fragment.editTeamSkill", controller: this }).then(function (oDialog) {
                //             oView.addDependent(oDialog);
                //             return oDialog;
                //         });
                //     }
                // }
                // this.editDialog.then(function (oDialog) {
                //     oDialog.setBindingContext(oEditContext);
                //     oDialog.setModel(oModel);
                //     oDialog.open();
                // })
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
                this.getView().getModel().submitBatch("customersGroup").then(fnSuccess, fnError);
            },
            handleCloseTS: function () {
                this.editDialog.then(function (oDialog) {
                    oDialog.close();
                })
            },
            handleCancelBtnPressTS: function () {
                this.byId("tableCountry").getBinding("items").resetChanges();
                this.handleCloseTS();
            },
            //ADD TEAM SKILL
            openManageCountryFrag: function () {
                // // MessageBox.error('good')
                // var oView = this.getView();
                // if (!this.ManageCountryFrag) {
                //     this.ManageCountryFrag = Fragment.load({ id: oView.getId(), name: "zleavetracker.fragment.manageCountry", controller: this }).then(function (manageCountry) {
                //         oView.addDependent(manageCountry);
                //         return manageCountry;
                //     });
                // }
                // this.ManageCountryFrag.then(function (manageCountry) {
                //     manageCountry.open();
                // }.bind(this));
            },
            closeManageCountryFrag: function () {
                this.ManageCountryFrag.then(function (manageCountry) {
                    BusyIndicator.hide()
                    manageCountry.close();
                });
            },
            saveManageCountryFrag: function () {
                BusyIndicator.show(0)
                var that = this;
                var teamName = this.byId('teamName').getValue(),
                    teamDesc = this.byId('teamDesc').getValue(),
                    data = {
                        "teamName": teamName,
                        "description": teamDesc
                    };
                $.ajax({
                    url: "/leaveApi/Country",
                    type: "POST",
                    data: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (res) {
                        that.closeManageCountryFrag();
                        MessageBox.success('Team name ' + res.teamName + ' is added.');
                        that.refreshTable()
                    },
                    error: function (error) {
                        that.closeManageCountryFrag();
                        MessageBox.error('Team name not added.')
                        that.refreshTable()
                    }
                });
                this.byId('teamName').setValue('');
                this.byId('teamDesc').setValue();
            },
            //to refresh table data
            refreshTable: function () {
                this.byId("tableCountry").getBinding("items").refresh();
            },
            //Delete team skill
            deleteSkill: function () {
                // MessageBox.warning("You want to delete.")
                // var that = this;
                // var pathLeave = this.byId("tableCountry").getSelectedItem().getBindingContext().sPath.split('\'')[1];
                // $.ajax({
                //     url: "/leaveApi/Teams('" + pathLeave + "')",
                //     type: "DELETE",
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     success: function (data) {
                //         MessageBox.success("success")
                //         that.refreshTable()
                //     },
                //     error: function (error) {
                //         console.log(`Error ${error}`);
                //     }
                // });
            },
            onButtonNavigationBack: function () {
                this.oRouter.navTo("Routemain");
            },
            createColumnConfig: function () {
                // var aCols = [];
                // aCols.push({
                //     label: 'Team Name',
                //     property: 'teamName',
                //     type: EdmType.String
                // });

                // aCols.push({
                //     label: 'Description',
                //     type: EdmType.String,
                //     property: 'description',
                //     scale: 0
                // });
                // return aCols;
            },
            teamskillExport: function () {
                // var aCols, oRowBinding, oSettings, oSheet, oTable;
                // if (!this._oTable) {
                //     this._oTable = this.byId('tableCountry');
                // }
                // oTable = this._oTable;
                // oRowBinding = oTable.getBinding('items');
                // aCols = this.createColumnConfig();

                // oSettings = {
                //     workbook: {
                //         columns: aCols,
                //         hierarchyLevel: 'Level'
                //     },
                //     dataSource: oRowBinding,
                //     fileName: 'Team Skill Data.xlsx',
                //     worker: false // We need to disable worker because we are using a MockServer as OData Service
                // };
                // oSheet = new Spreadsheet(oSettings);
                // oSheet.build().finally(function () {
                //     oSheet.destroy();
                // });
            }
        })
    });