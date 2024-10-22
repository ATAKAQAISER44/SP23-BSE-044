

var userid = document.querySelector("#userId");
var contact = document.querySelector("#contact");
var password = document.querySelector("#password");
var confirmPassword = document.querySelector("#confirmPassword");

var form = document.querySelector("#formid");

form.addEventListener("submit", (event) => {

    // Check the values of the input fields
    if (userid.value === '' || contact.value === '' ||
        password.value === '' || confirmPassword.value === '') {
            alert("All feild are mandatory");
            // Prevent the form from submitting by default
    event.preventDefault();
    event.stopPropagation();

    } 

    else if(contact.value.length < 10 ||contact.value.length > 10  ){
       alert("Please anter valid number");
       event.preventDefault();
       event.stopPropagation();

    }

    else if(isNaN(contact.value)){
        alert("only numbers are allowed!")
        event.preventDefault();
        event.stopPropagation();

    }

    else if(password.value !== confirmPassword.value){
        alert("Enter same password")
        event.preventDefault();
        event.stopPropagation();
    }
    else{
      alert("form submitted successfully")
    }
});

    // // Check the values of the input fields
    // if (userid.value !== '' && contact.value !== '' &&
    //     password.value !== '' && confirmPassword.value !== '') 

    // event.stopPropagation();
    // this function prevents the bubbling of the even


    document.getElementById('showPasswordCheck').addEventListener('change', function () {
      let passwordField = document.getElementById('password');
      let confirmPasswordField = document.getElementById('confirmPassword');
      if (this.checked) {
          passwordField.type = 'text';
          confirmPasswordField.type = 'text';
      } else {
          passwordField.type = 'password';
          confirmPasswordField.type = 'password';
      }
  });















