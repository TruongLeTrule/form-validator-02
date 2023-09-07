function Validator(formSelector, options = {}) {
  // Form rules object
  var formRules = {};

  // Validator rules object
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      const regrex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
      return regrex.test(value) ? undefined : "Vui lòng nhập gmail hợp lệ";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Mật khẩu tối thiểu ${min} kí tự`;
      };
    },
  };

  // Get form element
  const formElement = document.querySelector(formSelector);

  // Get form group element
  function getFormGroup(element) {
    while (element.parentElement) {
      if (element.parentElement.matches(".form-group")) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  if (formElement) {
    // Get input elements
    const inputs = Array.from(formElement.querySelectorAll("[name][rules]"));

    // Add form rules from input element
    formRules = inputs.reduce(function (formRules, element) {
      // Put rule name to array
      var rules = element.getAttribute("rules").split("|");
      rules.forEach(function (rule, index) {
        if (rule.includes(":")) {
          var ruleInfo = rule.split(":");
          rules[index] = validatorRules.min(ruleInfo[1]);
        }
      });

      // Set rule function
      rulesFunction = rules.map(function (rule) {
        if (typeof rule !== "function") {
          return validatorRules[rule];
        } else {
          return rule;
        }
      });
      formRules[element.name] = rulesFunction;

      return formRules;
    }, {});

    // Handle all inputs event
    inputs.forEach(function (input) {
      input.onblur = handleValidate;
      input.oninput = handleClearError;
    });

    // Handle validate function
    function handleValidate(e) {
      var errorMessage;
      var rules = formRules[e.target.name];
      var formGroup = getFormGroup(e.target);

      for (rule of rules) {
        if (rule(e.target.value)) {
          errorMessage = rule(e.target.value);
          break;
        }
      }

      // If error message exists
      if (errorMessage) {
        if (formGroup) {
          formGroup.querySelector(".form-message").innerText = errorMessage;
          formGroup.classList.add("invalid");
        }
      } else {
        if (formGroup) {
          formGroup.querySelector(".form-message").innerText = "";
          formGroup.classList.remove("invalid");
        }
      }

      return !errorMessage;
    }

    // Handle clear error when input
    function handleClearError(e) {
      var formGroup = getFormGroup(e.target);

      if (formGroup.classList.contains("invalid")) {
        formGroup.querySelector(".form-message").innerText = "";
        formGroup.classList.remove("invalid");
      }
    }

    // Handle submit form event
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;
      var values = {};

      inputs.forEach(function (input) {
        if (!handleValidate({ target: input })) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          inputs.forEach(function (input) {
            values[input.name] = input.value;
          });
          options.onSubmit(values);
        } else {
          formElement.submit();
        }
      } else {
        console.log("error");
      }
    };
  }
}
