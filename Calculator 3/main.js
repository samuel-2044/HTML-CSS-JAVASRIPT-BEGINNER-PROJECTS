const display = document.querySelector(".display");
const buttons = document.querySelectorAll("button");
const specialChars = ["%", "*", "/", "-", "+", "="];
let output = "";
// Calculate based on button clicked
const calculate = (btnValue) => {
  display.focus();
  if (btnValue === "=" && output !== "") {
    // Replace '%' with '/100' before evaluating
    output = eval(output.replace("%", "/100"));
  } else if (btnValue === "AC") {
    output = "";
  } else if (btnValue === "DEL") {
    // Remove last character for DEL
    output = output.toString().slice(0, -1);
  } else {
    // Skip if empty output and special char
    if (output === "" && specialChars.includes(btnValue)) return;
    output += btnValue;
  }
  display.value = output;
};
// Add click listeners to buttons
buttons.forEach((button) => {
  // Call calculate with button's data value
  button.addEventListener("click", (e) => calculate(e.target.dataset.value));
});