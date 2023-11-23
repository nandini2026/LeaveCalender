sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/ui/core/Fragment',
    'sap/ui/core/BusyIndicator'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox, Fragment, BusyIndicator) {
        "use strict";

        return Controller.extend("com.sap.zleavetracker.controller.report", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
            },
            onGotoMainView: function () {
                this.oRouter.navTo("Routemain");
            },
            openManageTeamFrag: function () {
                // MessageBox.error('good')
                var oView = this.getView();
                if (!this.ManageTeamFrag) {
                    this.ManageTeamFrag = Fragment.load({ id: oView.getId(), name: "com.sap.zleavetracker.fragment.manageTeam", controller: this }).then(function (manageTeam) {
                        oView.addDependent(manageTeam);
                        return manageTeam;
                    });
                }
                this.ManageTeamFrag.then(function (manageTeam) {
                    manageTeam.open();
                }.bind(this));
            },
            closeManageTeamFrag: function () {
                this.ManageTeamFrag.then(function (manageTeam) {
                    BusyIndicator.hide()
                    manageTeam.close();
                });
            },
            saveManageTeamFrag: function () {
                BusyIndicator.show(0)
                var that = this;
                var teamName = this.byId('teamName').getValue(),
                    teamDesc = this.byId('teamDesc').getValue(),
                    data = {
                        "teamName": teamName,
                        "description": teamDesc
                    };
                $.ajax({
                    url: "/leaveApi/Teams",
                    type: "POST",
                    data: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (res) {
                        that.closeManageTeamFrag();
                        MessageBox.success('Team name ' + res.teamName + ' is added.');
                    },
                    error: function (error) {
                        that.closeManageTeamFrag();
                        MessageBox.error('Team name not added.')
                    }
                });
                this.byId('teamName').setValue('');
                this.byId('teamDesc').setValue();
            },
            openManageCountryFrag: function () {
                // MessageBox.error('good')
                var oView = this.getView();
                if (!this.ManageCountryFrag) {
                    this.ManageCountryFrag = Fragment.load({ id: oView.getId(), name: "com.sap.zleavetracker.fragment.manageCountry", controller: this }).then(function (manageCountry) {
                        oView.addDependent(manageCountry);
                        return manageCountry;
                    });
                }
                this.ManageCountryFrag.then(function (manageCountry) {
                    manageCountry.open();
                }.bind(this));
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
                var countryName = this.byId('countryName').getValue(),
                    data = {
                        "country": countryName
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
                        MessageBox.success('Country name ' + res.country + ' is added.');
                    },
                    error: function (error) {
                        that.closeManageCountryFrag();
                        MessageBox.error('Country name not added.')
                    }
                });
                this.byId('countryName').setValue('');
            },
            openManageCityFrag: function () {
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
                var contryName = this.byId('cbcityy')._getSelectedItemText(),
                    contryid = this.byId('cbcityy').getSelectedKey(),
                    cityName = this.byId('cityinp').getValue(),
                    data = {
                        "countryID": contryid,
                        "country": contryName,
                        "city": cityName
                    }
                $.ajax({
                    url: "/leaveApi/CountryCity",
                    type: "POST",
                    data: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (res) {
                        that.closeManageCityFrag();
                        MessageBox.success('City name ' + res.city + ' is added.');
                    },
                    error: function (error) {
                        that.closeManageCityFrag();
                        MessageBox.error('City name not added.')
                    }
                });
                this.byId('cbcityy').setSelectedKey('');
                // this.byId('cbcityy').setSelectedKey('');
                this.byId('cityinp').setValue('');
            },
            openManagePublichHolidayFrag: function () {
                var oView = this.getView();
                if (!this.ManagePublichHolidayFrag) {
                    this.ManagePublichHolidayFrag = Fragment.load({ id: oView.getId(), name: "com.sap.zleavetracker.fragment.managePublichHoliday", controller: this }).then(function (managePublichHoliday) {
                        oView.addDependent(managePublichHoliday);
                        return managePublichHoliday;
                    });
                }
                this.ManagePublichHolidayFrag.then(function (managePublichHoliday) {
                    managePublichHoliday.open();
                }.bind(this));
            },
            closeManagePublichHolidayFrag: function () {
                this.ManagePublichHolidayFrag.then(function (managePublichHoliday) {
                    BusyIndicator.hide()
                    managePublichHoliday.close();
                });
            },
            saveManagePublichHolidayFrag: function () {
                var that = this;
                var cityName = this.byId('phcity')._getSelectedItemText(),
                    // PHstartdate = this._setReadLocalTimeZonePH(this.byId('phdate').getValue()),
                    PHstartdate = this.byId('phdate').getDateValue(),
                    PHenddate = new Date(PHstartdate.getTime() + 24 * 60 * 60 * 1000),
                    PDdesc = this.byId('PHINPd').getValue(),
                    pic = "sap-icon://general-leave-request",
                    type = "Type01",
                    phid = Math.floor(Math.random() * (1000000000 - 1 + 1) + 1),
                    data = {
                        "puHoliID": phid,
                        "location": cityName,
                        "startDate": PHstartdate,
                        "endDate": PHenddate,
                        "description": PDdesc,
                        "pic": pic,
                        "type": type,
                        "employee_employeeID": null
                    };
                $.ajax({
                    url: "/leaveApi/PublicHolidays",
                    type: "POST",
                    data: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (res) {
                        that.closeManagePublichHolidayFrag();
                        MessageBox.success('Public Holiday with name ' + res.description + ' is added.');
                    },
                    error: function (error) {
                        that.closeManagePublichHolidayFrag();
                        MessageBox.error('Public Holiday name not added.')
                    }
                });




            },
            handleChangeCountry2: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();
                this.byId('phcity').setProperty('visible', true)
                this.doFilteronCityDropDownPH(sValue);
            },
            doFilteronCityDropDownPH: function (country_value) {
                var oComboBoxControl = this.getView().byId("phcity");
                var oBindingComboBox = oComboBoxControl.getBinding("items");
                var aFiltersComboBox = [];
                var oFilterComboBox = new sap.ui.model.Filter("country", "Contains", country_value);
                aFiltersComboBox.push(oFilterComboBox);
                oBindingComboBox.filter(aFiltersComboBox);
            },
            _setReadLocalTimeZonePH: function (datevalue) {
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

        })
    });