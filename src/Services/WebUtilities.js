function WebUtilities(){

    this.showToast = function () {
        console.log("showToast throw a snack bar");
    };

    this.showProgressDialog = function () {
        console.log("showProgressDialog");
    };

    this.hideProgressDialog = function () {
        console.log("hideProgressDialog");
    };

    this.setBiometricFlag = function () {
        console.log("setBiometricFlag");
    };

    this.signInWithBiometrics = function() {
        console.log("signInWithBiometrics");
    };

}

export default new WebUtilities(); 