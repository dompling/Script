function createHTML() {
  return `
<div
  id="form-mask"
  class="v-overlay v-overlay--active theme--dark"
  style="z-index: 201; display: none"
>
  <div
    class="v-overlay__scrim"
    style="
      opacity: 0.46;
      background-color: rgb(33, 33, 33);
      border-color: rgb(33, 33, 33);
    "
  ></div>
  <div class="v-overlay__content"></div>
</div>

<div
  tabindex="0"
  role="document"
  id="textarea-form"
  class="v-dialog__content v-dialog__content--active"
  style="z-index: 202; display: none"
>
  <div
    class="v-dialog v-dialog--active"
    style="transform-origin: center center"
  >
    <div class="v-card v-sheet theme--light">
      <div id="textarea-form-data"></div>
      <div class="v-card__actions">
        <div class="spacer"></div>
        <button
          type="button"
          class="v-btn v-btn--text theme--light v-size--small grey--text"
        >
          <span class="v-btn__content" id="textarea-cancel">关闭</span>
        </button>
        <button
          type="button"
          class="v-btn v-btn--text theme--light v-size--small primary--text"
        >
          <span class="v-btn__content" id="textarea-save">保存</span>
        </button>
      </div>
    </div>
  </div>
</div>
<script type="text/javascript" src="https://cdn.staticfile.org/jquery/1.10.0/jquery.min.js"></script>`;
}

function createJS() {
  return `
  <script>
    function closeTextareaMask() {
      $("#form-mask").hide();
      $("#textarea-form").hide();
      $("#textarea-form-data").html("");
    }

    $("#textarea-cancel,#form-mask").on("click", function () {
      closeTextareaMask();
    });

    $("textarea").on("focus", function () {
      const $this = $(this);
      let data = $(this).val();
      try {
        data = JSON.parse(data);
        if (!data.length && Object.keys(data[0]).length) return;
      } catch (error) {
        return;
      }

      $("#form-mask").show();
      $("#textarea-form").show();
      const title = $this.parent().children("label").text();

      let html = \`\`;
      data.forEach((item, index) => {
        const formItem = Object.keys(item);
        html += \`<div class="v-card__title">\${title}-\${index + 1}</div>  
        <hr
          role="separator"
          aria-orientation="horizontal"
          class="v-divider theme--light"
        /><form class="v-card__text">\`;

        formItem.forEach((key) => {
          html += \`<div class="v-input v-input--is-label-active v-input--is-dirty theme--light v-text-field v-text-field--is-booted">
            <div class="v-input__control">
              <div class="v-input__slot">
                <div class="v-text-field__slot">
                  <label
                    for="\${key}"
                    class="v-label v-label--active theme--light"
                    style="left: 0px; right: auto; position: absolute"
                    >\${key}</label
                  ><input id="key" type="text" name="\${key}" value="\${item[key]}" />
                </div>
              </div>
            </div>
          </div>\`;
        });

        html += \`</form><hr
          role="separator"
          aria-orientation="horizontal"
          class="v-divider theme--light"
        />\`;
      });
      $("#textarea-form-data").prepend(html);

      $("#textarea-save").on("click", function () {
        const data = [];
        const formList = $("#textarea-form-data").children("form");
        for (let index = 0; index < formList.length; index++) {
          const form = formList[index];
          const updateItem = $(form).serializeArray();
          const dataItem = {};
          updateItem.forEach((item) => {
            dataItem[item.name] = item.value;
          });
          data.push(dataItem);
        }
        let val = JSON.stringify(data, null, \`\t\`);
        $this.val(val);
        $this.text(val);
        closeTextareaMask();
      });
    });
    </script> `;
}

const html = `${createHTML()}${createJS()}`;
const mask_div = document.createElement("div");
mask_div.id = "custome-mask";
mask_div.innerHTML = html;

document.body.append(div);
