sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/unified/library',
    'sap/m/library',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    "sap/m/MessageToast",
    'sap/ui/core/library',
    'sap/ui/model/Filter',
    '../utils/formatter',
    'sap/m/MenuItem'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,  JSONModel, unifiedLibrary, mLibrary, Fragment, MessageBox, MessageToast, coreLibrary, Filter,formatter, MenuItem) {
        "use strict";
        var ValueState = coreLibrary.ValueState
        var StandardCalendarLegendItem = unifiedLibrary.StandardCalendarLegendItem,
            PlanningCalendarBuiltInView = mLibrary.PlanningCalendarBuiltInView;


        return Controller.extend("com.sap.zleavetracker.controller.main", {
            formatter: formatter,
            onInit: function () {
                this.fillLocalModel();
                this.oRouter = this.getOwnerComponent().getRouter();
                var odata = {
                    "startDate": new Date()
                }
                var moLoc = this.getOwnerComponent().getModel('LocalModel')
                this.getView().setModel(moLoc, "LocationDataModel");
                var oModel = new JSONModel();
                oModel.setData(odata)
                this.getView().setModel(oModel, 'localModel')
                var oStateModel = new JSONModel();
                oStateModel.setData({legendShown: false});
                this.getView().setModel(oStateModel, "stateModel");
                this.byId("deleteEmpBtn").setProperty('enabled', false)
                
            },
            fillLocalModel:function () {
                var x =this;
                
                $.ajax({
                    url:"/leaveApi/Employees?$expand=*",
                    type:"GET",
                    success:function (data) {
                        var y = {Employees:data.value}
                        x.getOwnerComponent().getModel('NewModel').setData(y);
                        console.log(data);
                        x.fillSolmanModel();
                    },
                    error:function (error) {
                        console.log(`Error ${error}`);
                    }
                });
            },
            fillSolmanModel:function(){
                var oData = this.getView().getModel('NewModel').getData();
                var empIds = [];
                for (var i = 0; i < oData.Employees.length; i++) {
                    var employee = oData.Employees[i];
                    empIds.push(employee.employeeID);
                }
                console.log("Employee IDs:", empIds);
                var oSolmanData = this.getView().getModel('solmanModel').getData();
                oSolmanData.results.forEach(solmanTask =>{
                    var oSolmanEmpId = solmanTask.employeeID;
                    empIds.forEach((emp,i) =>{
                        if(emp === oSolmanEmpId){
                            oData.Employees[i].leave.push(solmanTask);
                            // var oTask = this.getView().getModel('NewModel').getData();
                        }
                    })
                });
                this.getView().getModel('NewModel').setData(oData);
                this.getView().getModel('NewModel').refresh();
            },
            // teamnameChangeEvent: function(oEvent){
            //     var selectedval = oEvent.getSource().getValue();
            //     var aFilter = new sap.ui.model.Filter( "team_teamName", sap.ui.model.FilterOperator.Contains, selectedval) ;
            //     this.byId('PC1').getBinding('rows').filter([aFilter]);
            // },
            // locationChangeEvent: function(oEvent){
            //     var selectedval = oEvent.getSource().getValue();
            //     var aFilter = new sap.ui.model.Filter( "location", sap.ui.model.FilterOperator.Contains, selectedval) ;
            //     this.byId('PC1').getBinding('rows').filter([aFilter]);
            // },
            handleFilteroperation: function(){
                var locationVal = this.byId('combolocation').getValue();
                var teamNameVal = this.byId('combotamname').getValue();
                var lcoationFilter = new sap.ui.model.Filter( "location", sap.ui.model.FilterOperator.Contains, locationVal) ;
                var teamNameFilter = new sap.ui.model.Filter( "team_teamName", sap.ui.model.FilterOperator.Contains, teamNameVal) ;
                this.byId('PC1').getBinding('rows').filter([lcoationFilter,teamNameFilter]);
            },
            onBeforeRendering: function () {
                this.changeStandardItemsPerView();
            },
            handleViewChange: function () {
                this.changeStandardItemsPerView();
            },
            onGotoReportView: function () {
                this.oRouter.navTo("Routereport");
            },
            onGotoMaintainView: function () {
                this.oRouter.navTo("Routemaintain");
            },
            changeStandardItemsPerView: function () {
                var sViewKey = this.byId('PC1').getViewKey(),
                    oLegend = this.byId("PlanningCalendarLegend");

                if (sViewKey !== PlanningCalendarBuiltInView.OneMonth && sViewKey !== "OneMonth") {
                    oLegend.setStandardItems([StandardCalendarLegendItem.Today, StandardCalendarLegendItem.WorkingDay, StandardCalendarLegendItem.NonWorkingDay]);
                } else {
                    oLegend.setStandardItems(); // return defaults
                }
            },
             // add employee
             handleAddEmployeeCreate: function () {
                var oPlanningCalender = this.byId("PC1")
                var oMdel = oPlanningCalender.getBindingInfo('rows').binding.getModel()
                var oView = this.getView();
                if (!this._pAddEmpPopover) {
                    this._pAddEmpPopover = Fragment.load({id: oView.getId(), name: "com.sap.zleavetracker.fragment.addEmp", controller: this}).then(function (oaddEmpPopover) {
                        oView.addDependent(oaddEmpPopover);
                        return oaddEmpPopover;
                    });
                }
                this._pAddEmpPopover.then(function (oaddEmpPopover) {
                    oaddEmpPopover.open();
                }.bind(this));
                this.byId('cblswocation').setSelectedKey('')
                this.getView().byId('cbteamName').setSelectedKey('')
            },
            // save employee
            addNewEmployeeData: function () {
                var nameE = this.getView().byId('empName').getValue(),
                    teamName = this.getView().byId('cbteamName').getValue(),
                    loc = this.byId('wcblswocation')._getSelectedItemText(),
                    pic = this.getView().byId('pic').getValue(),
                    dataEmp = {
                        "employeeName": nameE,
                        "team_teamName": teamName,
                        "location": loc,
                        "pic": pic
                    }
                var oPlanningCalender = this.byId("PC1");
                var oBinding = this.byId("PC1").getBinding('rows')
                var oModel = oBinding.getModel()
                var that = this;
                $.ajax({
                    url: "/leaveApi/Employees",
                    type: "POST",
                    data: JSON.stringify(dataEmp),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (data) {
                        var x = JSON.stringify(data);
                        that.getView().getModel().refresh();
                        console.log(x);
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
                this._pAddEmpPopover.then(function (oaddEmpPopover) {
                    oaddEmpPopover.close();
                });
            

                this.getView().byId('empName').setValue('')
                this.getView().byId('cbteamName').setSelectedKey('')
                this.getView().byId('empID1').setValue('')
                this.byId('cblswocation').setSelectedKey('')
                this.byId('wcblswocation').setProperty('visible', false)
            },
            closeNewEmpAddDialog: function () {
                this._pAddEmpPopover.then(function (oaddEmpPopover) {
                    oaddEmpPopover.close();
                });
                this.byId('wcblswocation').setProperty('visible', false)
            },
            handleDeleteEmp: function () {
                var empname = this.byId("PC1").getSelectedRows()[0].getProperty('title')
                var oView = this.getView();
                var that = this;
                if (!this.deleteEmpPopup) {
                    this.deleteEmpPopup = Fragment.load({id: oView.getId(), name: "com.sap.zleavetracker.fragment.warningDelEmpPop", controller: this}).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this.deleteEmpPopup.then(function (oDialog) {
                    oDialog.open();
                    var delMeassageText = "Do you want to delete Employee with name : " + empname + "."
                    that.byId('delMes').setText(delMeassageText)
                }.bind(this));
            },
            deleteEmp: function (evt) {
                var pathLeave = this.byId("PC1").getSelectedRows()[0].getBindingContext().getPath(),
                    empID = pathLeave.split('(')[1].split(')')[0],
                    that = this;
                $.ajax({
                    url: "/leaveApi/Employees(" + empID + ")",
                    type: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (data) {
                        that.refreshBinding()
                        MessageBox.confirm("Employee  with ID : " + empID + " is deleted.");
                        that.byId("deleteEmpBtn").setProperty('enabled', false)
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
                this.clodeDelMes()
            },
            clodeDelMes: function () {
                this.deleteEmpPopup.then(function (oDialog) {
                    oDialog.close();
                }.bind(this));
            },
            _aDialogTypes: [
                {
                    title: "Create Appointment",
                    type: "create_appointment"
                }, {
                    title: "Create Appointment",
                    type: "create_appointment_with_context"
                }, {
                    title: "Edit Appointment",
                    type: "edit_appointment"
                }
            ],
            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment");
                if (oAppointment) {
                    this._handleSingleAppointment(oAppointment);
                }
            },
            leaveTypeVal: '',
            _handleSingleAppointment: function (oAppointment) {
                var oView = this.getView();
                var that = this;
                if (oAppointment === undefined) {
                    return;
                }
                if (! oAppointment.getSelected() && this._pDetailsPopover) {
                    this._pDetailsPopover.then(function (oDetailsPopover) {
                        oDetailsPopover.close();
                    });
                    return;
                }
                if (!this._pDetailsPopover) {
                    this._pDetailsPopover = Fragment.load({id: oView.getId(), name: "com.sap.zleavetracker.fragment.Details", controller: this}).then(function (oDetailsPopover) {
                        oView.addDependent(oDetailsPopover);
                        return oDetailsPopover;
                    });
                }
                this._pDetailsPopover.then(function (oDetailsPopover) {
                    that.leaveTypeVal = oDetailsPopover.getProperty('title')
                    this._setDetailsDialogContent(oAppointment, oDetailsPopover);
                }.bind(this));
            },
            _setDetailsDialogContent: function (oAppointment, oDetailsPopover) {
                oDetailsPopover.setBindingContext(oAppointment.getBindingContext('NewModel'),'NewModel');
                oDetailsPopover.openBy(oAppointment);
            },
            handleAppointmentCreate: function () {
                this._arrangeDialogFragment(this._aDialogTypes[0].type);
                this.byId('dayCount').setValue('')
            },
            _arrangeDialogFragment: function (iDialogType, oDetailsPopover) {
                var oView = this.getView();
    
                if (!this._pNewAppointmentDialog) {
                    this._pNewAppointmentDialog = Fragment.load({id: oView.getId(), name: "com.sap.zleavetracker.fragment.Create", controller: this}).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pNewAppointmentDialog.then(function (oDialog) {
                    this._arrangeDialog(iDialogType, oDialog, oDetailsPopover);
                }.bind(this));
            },
            _arrangeDialog: function (sDialogType, oDialog, oDetailsPopover) {
                var sTempTitle = "";
                oDialog._sDialogType = sDialogType;
                if (sDialogType === "edit_appointment") {
                    this._setEditAppointmentDialogContent(oDialog, oDetailsPopover);
                    sTempTitle = this._aDialogTypes[2].title;
                } else if (sDialogType === "create_appointment_with_context") {
                    this._setCreateWithContextAppointmentDialogContent();
                    sTempTitle = this._aDialogTypes[1].title;
                } else if (sDialogType === "create_appointment") {
                    this._setCreateAppointmentDialogContent();
                    sTempTitle = this._aDialogTypes[0].title;
                } else {
                    Log.error("Wrong dialog type.");
                }
                this.updateButtonEnabledState(oDialog);
                oDialog.setTitle(sTempTitle);
                oDialog.open();
            },
            _setEditAppointmentDialogContent: function (oDialog) {},
            _setCreateWithContextAppointmentDialogContent: function () {
                var aPeople = this.getView().getModel().getProperty('/people/'),
                    oSelectedIntervalStart = this.oClickEventParameters.startDate,
                    oStartDate = this.byId("startDate"),
                    oSelectedIntervalEnd = this.oClickEventParameters.endDate,
                    oEndDate = this.byId("endDate"),
                    oDateTimePickerStart = this.byId("startDate"),
                    oDateTimePickerEnd = this.byId("endDate"),
                    // oAppointmentType = this.byId("isIntervalAppointment"),
                    oTitleInput = this.byId("leaveType"),
                    oMoreInfoInput = this.byId("moreInfo"),
                    sPersonName,
                    oPersonSelected;
                if (this.oClickEventParameters.row) {
                    sPersonName = this.oClickEventParameters.row.getTitle();
                    oPersonSelected = this.byId("selectPerson");
                    oPersonSelected.setSelectedIndex(aPeople.indexOf(aPeople.filter(function (oPerson) {
                        return oPerson.name === sPersonName;
                    })[0]));
                }
                oStartDate.setDateValue(oSelectedIntervalStart);
                oEndDate.setDateValue(oSelectedIntervalEnd);
                oTitleInput.setSelectedKey("");
                oMoreInfoInput.setValue("");
                oDateTimePickerStart.setValueState(ValueState.None);
                oDateTimePickerEnd.setValueState(ValueState.None);
                delete this.oClickEventParameters;
            },
            _setCreateAppointmentDialogContent: function () {
                var oDateTimePickerStart = this.byId("startDate"),
                    oDateTimePickerEnd = this.byId("endDate"),
                    oTitleInput = this.byId("leaveType"),
                    oMoreInfoInput = this.byId("moreInfo"),
                    oPersonSelected = this.byId("selectPerson");
                // Set the person in the first row as selected.
                oPersonSelected.setSelectedItem(this.byId("selectPerson").getItems()[0]);
                oDateTimePickerStart.setValue("");
                oDateTimePickerEnd.setValue("");
                oDateTimePickerStart.setValueState(ValueState.None);
                oDateTimePickerEnd.setValueState(ValueState.None);
                oTitleInput.setValue("");
                oMoreInfoInput.setValue("");
                this.getView().byId('selectPerson').setSelectedKey('')
                this.getView().byId('leaveType').setSelectedKey('')
            },
            handleChangeSelect: function () {
                this.updateButtonEnabledState(this.byId("createDialog"));
            },
            reasonLeave: function () {
                this.updateButtonEnabledState(this.byId("createDialog"));
            },
            updateButtonEnabledState: function (oDialog) {
                var oStartDate = this.byId("startDate"),
                    oEndDate = this.byId("endDate"),
                    oEmployessVal = this.byId('selectPerson').getSelectedKey(),
                    oLeaveTypeVal = this.byId('leaveType').getSelectedKey(),
                    oReasonVal = this.byId('moreInfo').getValue(),
                    bEnabled = oStartDate.getValueState() !== ValueState.Error && oStartDate.getValue() !== "" && oEndDate.getValue() !== "" && oEndDate.getValueState() !== ValueState.Error && oEmployessVal !== "" && oLeaveTypeVal !== "" && oReasonVal !== "";
                oDialog.getBeginButton().setEnabled(bEnabled);
            },

            formatDate: function (oDate) {
                if (oDate) {
                    var iHours = oDate.getHours(),
                        iMinutes = oDate.getMinutes(),
                        iSeconds = oDate.getSeconds();
                    if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
                        return DateFormat.getDateTimeInstance({style: "medium"}).format(oDate);
                    } else {
                        return DateFormat.getDateInstance({style: "medium"}).format(oDate);
                    }
                }
            },
            handleCreateChange: function (oEvent) {
                var oDateTimePickerStart = this.byId("startDate"),
                    oDateTimePickerEnd = this.byId("endDate");
                if (oEvent.getParameter("valid")) {
                    this._validateDateTimePicker(oDateTimePickerStart, oDateTimePickerEnd);
                } else {
                    oEvent.getSource().setValueState(ValueState.Error);
                }
                this.updateButtonEnabledState(this.byId("createDialog"));
            },
            _validateDateTimePicker: function (oDateTimePickerStart, oDateTimePickerEnd) {
                var oStartDate = oDateTimePickerStart.getDateValue(),
                    oEndDate = oDateTimePickerEnd.getDateValue(),
                    sValueStateText = "Start date should be before End date",
                    sValueStateTextForSunSat = "Leave can't be applied for Saturday & Sunday",
                    sValueStateTextForSat = "Start date should not be a Saturday";
                if (oStartDate && oEndDate) {
                    var startDateJS = new Date(oStartDate);
                    var endDateJS = new Date(oEndDate);
            
                    var days = 0;U
                    if ((startDateJS.getDay() === 6 || startDateJS.getDay() === 0) || (endDateJS.getDay() ===0 || endDateJS.getDay() ===6 ) ){
                        oDateTimePickerStart.setValueStateText(sValueStateTextForSunSat);
                        oDateTimePickerStart.setValueState(sap.ui.core.ValueState.Error);
                        oDateTimePickerEnd.setValueStateText(sValueStateTextForSunSat);
                        oDateTimePickerEnd.setValueState(sap.ui.core.ValueState.Error);
                        return;
                    }
                    while (startDateJS <= endDateJS) {
                        var dayOfWeek = startDateJS.getDay();
            
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            days++;
                        }
            
                        startDateJS.setDate(startDateJS.getDate() + 1);
                    }
                    // oStartDate.setHours(0, 0, 0, 0);
                    // oEndDate.setHours(23, 59, 59, 999);
                    if (oEndDate.getTime() < oStartDate.getTime()) {
                        oDateTimePickerStart.setValueStateText(sValueStateText);
                        oDateTimePickerEnd.setValueStateText(sValueStateText);
                        oDateTimePickerStart.setValueState(sap.ui.core.ValueState.Error);
                        oDateTimePickerEnd.setValueState(sap.ui.core.ValueState.Error);
                    } else {
                        this.byId('dayCount').setValue(days);
                        oDateTimePickerStart.setValueState(sap.ui.core.ValueState.None);
                        oDateTimePickerEnd.setValueState(sap.ui.core.ValueState.None);
                    }
                }
            },
            
            handleDialogSaveButton: function () {
                var oStartDate = this.byId("startDate"),
                    oEndDate = this.byId("endDate"),
                    sInfoValue = this.byId("moreInfo").getValue(),
                    // sInputTitle = this.byId("inputTitle").getValue(),
                    sInputTitle = this.byId("leaveType").getSelectedKey(),
                    iPrsnId = this.byId("selectPerson").getSelectedKey(),
                    // iPersonId = Number(iPrsnId.replaceAll(',', '')),
                    iPersonId = iPrsnId,
                    oModel = this.getView().getModel(),
                    bIsIntervalAppointment = '',
                    oNewAppointmentDialog = this.byId("createDialog"),
                    oNewAppointment;
                if (oStartDate.getValueState() !== ValueState.Error && oEndDate.getValueState() !== ValueState.Error) {
                    if (this.sPath && oNewAppointmentDialog._sDialogType === "edit_appointment") {
                        this._editAppointment({
                            title: sInputTitle,
                            info: sInfoValue,
                            type: this.byId("detailsPopover").getBindingContext().getObject().type,
                            start: oStartDate.getDateValue(),
                            end: oEndDate.getDateValue()
                        }, bIsIntervalAppointment, iPersonId, oNewAppointmentDialog);
                    } else {
                        if (bIsIntervalAppointment) {
                            oNewAppointment = {
                                title: sInputTitle,
                                start: oStartDate.getDateValue(),
                                end: oEndDate.getDateValue()
                            };
                        } else {
                            var typeColor;
                            if (sInputTitle == "Planned") {
                                typeColor = "Type06";
                            } else if (sInputTitle == "Privilege") {
                                typeColor = "Type07";
                            } else if (sInputTitle == "Paternity") {
                                typeColor = "Type09";
                            } else if (sInputTitle == "Adoption") {
                                typeColor = "Type10";
                            } else if (sInputTitle == "Bereavement") {
                                typeColor = "Type11";
                            } else if (sInputTitle == "Leave Without Pay") {
                                typeColor = "Type12";
                            } else if (sInputTitle == "Comp-Off") {
                                typeColor = "Type13";
                            } else if (sInputTitle == "Re-location") {
                                typeColor = "Type14";
                            } else if (sInputTitle == "Sabbatical") {
                                typeColor = "Type15";
                            } else if (sInputTitle == "Gender Aiffirmation Surgery") {
                                typeColor = "Type16";
                            } else if (sInputTitle == "Optional holiday") {
                                typeColor = "Type01";
                            } else {
                                typeColor = "Type08";
                            } 
                            var oEndDateChanged = new Date(oEndDate.getDateValue().getTime()+86340000);
                            oNewAppointment = {
                                title: sInputTitle,
                                info: sInfoValue,
                                start: oStartDate.getDateValue(),
                                end: oEndDateChanged,
                                type: typeColor
                            };
                        }
                        this._addNewAppointment(oNewAppointment, iPersonId);
                    }
                    // oModel.updateBindings(true);
                    oNewAppointmentDialog.close();
                    this.getView().getModel().refresh();
                }
                this.getView().byId('selectPerson').setSelectedKey('')
            },
            _addNewAppointment: function (oAppointment, iPersonId) {
                var that = this;
                var startdate = this._setReadLocalTimeZone(oAppointment.start);
                var enddate = this._setReadLocalTimeZone(oAppointment.end);
                var dataLeave = {
                    "employeeID": iPersonId,
                    "startDate": startdate,
                    "endDate": enddate,
                    "title": oAppointment.title + " Leave",
                    "description": oAppointment.info,
                    "type": oAppointment.type
                }
                $.ajax({
                    url: "/leaveApi/Leaves",
                    type: "POST",
                    data: JSON.stringify(dataLeave),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (data) {
                        var x = JSON.stringify(data);
                        console.log(x);
                        that.fillLocalModel();
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
            },
            handleDialogCancelButton: function () {
                this.byId("createDialog").close();
            },
            _setReadLocalTimeZone: function (datevalue) {
                if (datevalue !== undefined && datevalue !== null && datevalue !== "") {
                    datevalue = new Date(datevalue);
                    var offSet = datevalue.getTimezoneOffset();
                    var offSetVal = offSet / 60;
                    var iHr = Math.floor(Math.abs(offSetVal));
                    var iMin = Math.floor((Math.abs(offSetVal) * 60) % 60);
                    datevalue = new Date(datevalue.setHours(iHr + datevalue.getHours(), iMin, 0, 0));
                    return datevalue;
                }
                return null;
            },
            // Consider local timezone while saving time entry details
            _setSaveLocalTimeZone: function (datevalue) {
                if (datevalue !== undefined && datevalue !== null && datevalue !== "") {
                    datevalue = new Date(datevalue);
                    var offSet = datevalue.getTimezoneOffset();
                    var offSetVal = offSet / 60;
                    var iHr = Math.floor(Math.abs(offSetVal));
                    var iMin = Math.floor((Math.abs(offSetVal) * 60) % 60);
                    datevalue = new Date(datevalue.setHours(iHr, iMin, 0, 0));
                    return datevalue;
                }
                return null;
            },
            handleEditButton: function () {
                var oDetailsPopover = this.byId("detailsPopover");
                this.sPath = oDetailsPopover.getBindingContext('NewModel').getPath();
                oDetailsPopover.close();
                this.editContext = oDetailsPopover.getBindingContext('NewModel');
                var oView = this.getView();
                if (!this._pEditAppointmentDialog) {
                    this._pEditAppointmentDialog = Fragment.load({id: oView.getId(), name: "com.sap.zleavetracker.fragment.EditCreate", controller: this}).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                var that = this
                this._pEditAppointmentDialog.then(function (oDialog) {
                    oDialog.setBindingContext(this.editContext,'NewModel');
                    var sTempTitle = that._aDialogTypes[2].title;
                    oDialog.setTitle(sTempTitle);
                    oDialog.open();
                    var x = that.leaveTypeVal.split(' ')[0]
                    that.byId('leaveType1').setSelectedKey(x)
                }.bind(this));
            },
            handleEditDialogSaveButton: function (e) {
                var that = this
                    var leaveID = this.byId('leaveID').getValue(),
                        empID = this.byId('empID').getValue(),
                        title = this.byId('leaveType1').getSelectedKey(),
                        startDate = this.byId('start_Date').getDateValue(),
                        endDate = this.byId('end_Date').getDateValue(),
                        description = this.byId('more_Info').getValue();
                    var typeColor;
                    if (title == "Planned") {
                        typeColor = "Type06";
                    } else {
                        typeColor = "Type08";
                    }
                    var dataEditLeave = {
                        "empLeaveID": leaveID,
                        "employeeID": empID,
                        "startDate": startDate,
                        "endDate": endDate,
                        "title": title + ' Leave',
                        "description": description,
                        "type": typeColor
                    }
                    $.ajax({
                        url: "/leaveApi/Leaves(" + leaveID + ")",
                        type: "PUT",
                        data: JSON.stringify(dataEditLeave),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        success: function (data) {
                            // var x = JSON.stringify(data);
                            // console.log(x);
                            that.getView().getModel().resetChanges()
                            that.getView().getModel().refresh()
                        },
                        error: function (error) {
                            console.log(`Error ${error}`);
                        }
                    });
                    this.byId("editCreateDialog").close();
            },
            refreshBinding: function (e) {
                this.getView().getModel().resetChanges()
                this.getView().getModel().refresh();
            },
            onRowselect: function (evt) {
                var x = evt.getSource();
                var oDetailsPopover = this.byId("PC1");
                if (oDetailsPopover.getSelectedRows().length == 1) {
                    this.byId("deleteEmpBtn").setProperty('enabled', true)
                } else {
                    this.byId("deleteEmpBtn").setProperty('enabled', false)
                }
            },
            handleEditDialogCancelButton: function () {
                this.byId("editCreateDialog").close();
            },
            handleDeleteAppointment: function (evt) {
                var oDetailsPopover = this.byId("detailsPopover"),
                    pathLeave = this.byId("detailsPopover").getBindingContext('NewModel').getPath(),
                    idLeave = oDetailsPopover.getBindingContext('NewModel').getObject().empLeaveID,
                    that = this;
                $.ajax({
                    url: "/leaveApi/Leaves(" + idLeave + ")",
                    type: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (data) {
                        that.refreshBinding()
                        MessageBox.confirm("Leave with ID : " + idLeave + " is deleted.");
                    },
                    error: function (error) {
                        console.log(`Error ${error}`);
                    }
                });
                oDetailsPopover.close();
            },
            handleChangeCountry1: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();
                this.byId('wcblswocation').setProperty('visible', true)
                this.doFilteronCityDropDown(sValue);
            },
            doFilteronCityDropDown: function (country_value) { 
                var oComboBoxControl = this.getView().byId("wcblswocation");
                var oBindingComboBox = oComboBoxControl.getBinding("items");
                var aFiltersComboBox = [];
                var oFilterComboBox = new sap.ui.model.Filter("country", "Contains", country_value);
                aFiltersComboBox.push(oFilterComboBox);
                oBindingComboBox.filter(aFiltersComboBox);
            },
            onMenuAction: function(oEvent) {
				var oItem = oEvent.getParameter("item"),
					sItemPath = "";

				while (oItem instanceof MenuItem) {
					sItemPath = oItem.getText() + " > " + sItemPath;
					oItem = oItem.getParent();
				}

				sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));

				MessageToast.show("Action triggered on item: " + sItemPath);
                if(sItemPath == 'Manage Team Skills'){
               
                    this.oRouter.navTo("RoutemaintteamSkill");
                }else if(sItemPath == 'Maintain Country'){
                    this.oRouter.navTo("RoutemaintCountry");
                }else if(sItemPath == 'Maintain City'){
                    this.oRouter.navTo("RoutemaintCity");
                }else if(sItemPath == 'Manage Public Holiday'){
                    this.oRouter.navTo("RoutemaintPublicHoliday");
                }
			}
        }); 
    });
