/* =========================================
   JOBFLOW AI — UI ENGINE
   ========================================= */

const UIEngine = {

  /* -----------------------------------------
     BASIC HELPERS
     ----------------------------------------- */

  escape(value) {

    return String(value ?? "")
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  },


  $(selector) {

    return document.querySelector(
      selector
    );

  },


  $$(selector) {

    return [
      ...document.querySelectorAll(
        selector
      )
    ];

  },


  create(
    tag,
    className = "",
    content = ""
  ) {

    const element =
      document.createElement(
        tag
      );


    if (
      className
    ) {

      element.className =
        className;

    }


    if (
      content
    ) {

      element.innerHTML =
        content;

    }


    return element;

  },


  /* -----------------------------------------
     NOTIFICATIONS
     ----------------------------------------- */

  notify(
    message,
    type = "success",
    duration = 3000
  ) {

    let container =
      this.$(
        "#jobflow-notifications"
      );


    if (!container) {

      container =
        this.create(
          "div",
          "jobflow-notifications"
        );

      container.id =
        "jobflow-notifications";


      document.body.appendChild(
        container
      );

    }


    const notification =
      this.create(
        "div",
        "jobflow-notification " +
        "jobflow-" +
        type
      );


    notification.innerHTML =

      "<span>" +
      this.escape(
        message
      ) +
      "</span>" +

      "<button type=\"button\" " +
      "aria-label=\"Close\">×</button>";


    const close =
      notification.querySelector(
        "button"
      );


    close.onclick =
      () => {

        notification.remove();

      };


    container.appendChild(
      notification
    );


    if (
      duration > 0
    ) {

      setTimeout(
        () => {

          if (
            notification
              .isConnected
          ) {

            notification.remove();

          }

        },
        duration
      );

    }


    return notification;

  },


  success(
    message
  ) {

    return this.notify(
      message,
      "success"
    );

  },


  error(
    message
  ) {

    return this.notify(
      message,
      "error",
      4500
    );

  },


  warning(
    message
  ) {

    return this.notify(
      message,
      "warning",
      4000
    );

  },


  info(
    message
  ) {

    return this.notify(
      message,
      "info"
    );

  },


  /* -----------------------------------------
     MODAL
     ----------------------------------------- */

  modal(
    title,
    content,
    options = {}
  ) {

    this.closeModal();


    const overlay =
      this.create(
        "div",
        "jobflow-modal-overlay"
      );


    overlay.id =
      "jobflow-modal";


    const box =
      this.create(
        "div",
        "jobflow-modal"
      );


    box.innerHTML =

      "<div class=\"jobflow-modal-header\">" +

        "<h2>" +
        this.escape(
          title
        ) +
        "</h2>" +

        "<button " +
        "type=\"button\" " +
        "class=\"jobflow-modal-close\" " +
        "aria-label=\"Close\">×</button>" +

      "</div>" +

      "<div class=\"jobflow-modal-body\">" +
      content +
      "</div>";


    overlay.appendChild(
      box
    );


    document.body.appendChild(
      overlay
    );


    const close =
      box.querySelector(
        ".jobflow-modal-close"
      );


    close.onclick =
      () => {

        this.closeModal();

      };


    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay &&
          options.closeOnOverlay !==
          false
        ) {

          this.closeModal();

        }

      }
    );


    document.addEventListener(
      "keydown",
      this._modalEscape
    );


    return overlay;

  },


  _modalEscape(event) {

    if (
      event.key ===
      "Escape"
    ) {

      UIEngine.closeModal();

    }

  },


  closeModal() {

    const modal =
      this.$(
        "#jobflow-modal"
      );


    if (modal) {

      modal.remove();

    }


    document.removeEventListener(
      "keydown",
      this._modalEscape
    );

  },


  /* -----------------------------------------
     CONFIRM DIALOG
     ----------------------------------------- */

  confirm(
    message,
    onConfirm
  ) {

    const content =

      "<p class=\"jobflow-confirm-message\">" +
      this.escape(
        message
      ) +
      "</p>" +

      "<div class=\"jobflow-modal-actions\">" +

      "<button " +
      "type=\"button\" " +
      "data-confirm=\"no\">Cancel</button>" +

      "<button " +
      "type=\"button\" " +
      "data-confirm=\"yes\">Confirm</button>" +

      "</div>";


    const modal =
      this.modal(
        "Confirm Action",
        content
      );


    modal
      .querySelector(
        "[data-confirm=\"no\"]"
      )
      .onclick =
      () => {

        this.closeModal();

      };


    modal
      .querySelector(
        "[data-confirm=\"yes\"]"
      )
      .onclick =
      () => {

        this.closeModal();

        if (
          typeof onConfirm ===
          "function"
        ) {

          onConfirm();

        }

      };

  },


  /* -----------------------------------------
     TABS
     ----------------------------------------- */

  tabs(
    container,
    options = {}
  ) {

    const root =
      typeof container ===
      "string"

        ? this.$(
            container
          )

        : container;


    if (!root) {

      return;

    }


    const buttons =
      [
        ...root.querySelectorAll(
          "[data-tab]"
        )
      ];


    const panels =
      [
        ...root.querySelectorAll(
          "[data-panel]"
        )
      ];


    const activate =
      id => {

        buttons.forEach(
          button => {

            button.classList.toggle(
              "active",
              button.dataset.tab ===
              id
            );

          }
        );


        panels.forEach(
          panel => {

            panel.hidden =
              panel.dataset.panel !==
              id;

          }
        );


        if (
          typeof options.onChange ===
          "function"
        ) {

          options.onChange(
            id
          );

        }

      };


    buttons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            activate(
              button.dataset.tab
            );

          }
        );

      }
    );


    if (
      buttons.length
    ) {

      activate(
        buttons[0].dataset.tab
      );

    }

  },


  /* -----------------------------------------
     PROGRESS BAR
     ----------------------------------------- */

  progress(
    value,
    label = ""
  ) {

    const percent =
      Math.max(
        0,
        Math.min(
          100,
          Number(value) || 0
        )
      );


    return (

      "<div class=\"jobflow-progress\">" +

        "<div class=\"jobflow-progress-top\">" +

          "<span>" +
          this.escape(
            label
          ) +
          "</span>" +

          "<strong>" +
          percent +
          "%</strong>" +

        "</div>" +

        "<div class=\"jobflow-progress-track\">" +

          "<div " +
          "class=\"jobflow-progress-value\" " +
          "style=\"width:" +
          percent +
          "%\"></div>" +

        "</div>" +

      "</div>"

    );

  },


  /* -----------------------------------------
     STAT CARD
     ----------------------------------------- */

  statCard(
    title,
    value,
    subtitle = "",
    icon = "•"
  ) {

    return (

      "<div class=\"jobflow-stat-card\">" +

        "<div class=\"jobflow-stat-icon\">" +
        this.escape(
          icon
        ) +
        "</div>" +

        "<div class=\"jobflow-stat-content\">" +

          "<span>" +
          this.escape(
            title
          ) +
          "</span>" +

          "<strong>" +
          this.escape(
            value
          ) +
          "</strong>" +

          (
            subtitle
              ? "<small>" +
                this.escape(
                  subtitle
                ) +
                "</small>"
              : ""
          ) +

        "</div>" +

      "</div>"

    );

  },


  /* -----------------------------------------
     BADGES
     ----------------------------------------- */

  badge(
    text,
    type = "default"
  ) {

    return (

      "<span class=\"jobflow-badge jobflow-badge-" +
      this.escape(
        type
      ) +
      "\">" +

      this.escape(
        text
      ) +

      "</span>"

    );

  },


  statusBadge(
    status
  ) {

    const map = {

      Saved:
        "default",

      Applied:
        "blue",

      Screening:
        "purple",

      Interview:
        "orange",

      "Final Round":
        "orange",

      Offer:
        "green",

      Rejected:
        "red"

    };


    return this.badge(
      status,
      map[status] ||
      "default"
    );

  },


  priorityBadge(
    priority
  ) {

    const map = {

      Low:
        "default",

      Medium:
        "blue",

      High:
        "orange",

      Urgent:
        "red"

    };


    return this.badge(
      priority,
      map[priority] ||
      "default"
    );

  },


  /* -----------------------------------------
     EMPTY STATE
     ----------------------------------------- */

  emptyState(
    title,
    message,
    buttonText = "",
    buttonAction = ""
  ) {

    return (

      "<div class=\"jobflow-empty-state\">" +

        "<div class=\"jobflow-empty-icon\">○</div>" +

        "<h3>" +
        this.escape(
          title
        ) +
        "</h3>" +

        "<p>" +
        this.escape(
          message
        ) +
        "</p>" +

        (
          buttonText
            ? "<button " +
              "type=\"button\" " +
              "onclick=\"" +
              this.escape(
                buttonAction
              ) +
              "\">" +
              this.escape(
                buttonText
              ) +
              "</button>"
            : ""
        ) +

      "</div>"

    );

  },


  /* -----------------------------------------
     SEARCH BOX
     ----------------------------------------- */

  searchBox(
    placeholder =
      "Search..."
  ) {

    return (

      "<div class=\"jobflow-search\">" +

        "<span>⌕</span>" +

        "<input " +
        "type=\"search\" " +
        "placeholder=\"" +
        this.escape(
          placeholder
        ) +
        "\" " +
        "data-jobflow-search>" +

      "</div>"

    );

  },


  /* -----------------------------------------
     TABLE
     ----------------------------------------- */

  table(
    columns,
    rows,
    emptyMessage =
      "No records found."
  ) {

    if (
      !rows.length
    ) {

      return this.emptyState(
        "Nothing here yet",
        emptyMessage
      );

    }


    let html =

      "<div class=\"jobflow-table-wrap\">" +

      "<table class=\"jobflow-table\">" +

      "<thead><tr>";


    columns.forEach(
      column => {

        html +=
          "<th>" +
          this.escape(
            column.label ||
            column
          ) +
          "</th>";

      }
    );


    html +=
      "</tr></thead><tbody>";


    rows.forEach(
      row => {

        html +=
          "<tr>";


        columns.forEach(
          column => {

            const key =
              column.key ||
              column;


            let value =
              row[key] ?? "";


            if (
              typeof column.render ===
              "function"
            ) {

              value =
                column.render(
                  value,
                  row
                );

            } else {

              value =
                this.escape(
                  value
                );

            }


            html +=
              "<td>" +
              value +
              "</td>";

          }
        );


        html +=
          "</tr>";

      }
    );


    html +=
      "</tbody></table></div>";


    return html;

  },


  /* -----------------------------------------
     DROPDOWN
     ----------------------------------------- */

  select(
    name,
    options,
    selected = ""
  ) {

    let html =

      "<select " +
      "name=\"" +
      this.escape(
        name
      ) +
      "\" " +
      "class=\"jobflow-select\">";


    options.forEach(
      option => {

        const value =
          typeof option ===
          "string"
            ? option
            : option.value;

        const label =
          typeof option ===
          "string"
            ? option
            : option.label;


        html +=

          "<option value=\"" +
          this.escape(
            value
          ) +
          "\"" +

          (
            value ===
            selected
              ? " selected"
              : ""
          ) +

          ">" +

          this.escape(
            label
          ) +

          "</option>";

      }
    );


    html +=
      "</select>";


    return html;

  },


  /* -----------------------------------------
     LOADING
     ----------------------------------------- */

  loading(
    message =
      "Loading..."
  ) {

    return (

      "<div class=\"jobflow-loading\">" +

        "<div class=\"jobflow-spinner\"></div>" +

        "<span>" +
        this.escape(
          message
        ) +
        "</span>" +

      "</div>"

    );

  },


  /* -----------------------------------------
     COPY TO CLIPBOARD
     ----------------------------------------- */

  async copy(
    text
  ) {

    try {

      await navigator
        .clipboard
        .writeText(
          text
        );


      this.success(
        "Copied to clipboard."
      );


      return true;

    } catch (error) {

      this.error(
        "Could not copy the content."
      );


      return false;

    }

  },


  /* -----------------------------------------
     DOWNLOAD TEXT FILE
     ----------------------------------------- */

  download(
    content,
    filename,
    type =
      "text/plain"
  ) {

    const blob =
      new Blob(
        [
          content
        ],
        {
          type:
            type
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;

    link.download =
      filename;


    document.body.appendChild(
      link
    );


    link.click();

    link.remove();


    setTimeout(
      () => {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );

  },


  /* -----------------------------------------
     SCROLL
     ----------------------------------------- */

  scrollTo(
    selector
  ) {

    const element =
      typeof selector ===
      "string"

        ? this.$(
            selector
          )

        : selector;


    if (
      element
    ) {

      element.scrollIntoView({
        behavior:
          "smooth",
        block:
          "start"
      });

    }

  },


  /* -----------------------------------------
     DEBOUNCE
     ----------------------------------------- */

  debounce(
    callback,
    delay = 300
  ) {

    let timer;


    return function(...args) {

      clearTimeout(
        timer
      );


      timer =
        setTimeout(
          () => {

            callback.apply(
              this,
              args
            );

          },
          delay
        );

    };

  },


  /* -----------------------------------------
     GLOBAL SEARCH
     ----------------------------------------- */

  enableSearch(
    input,
    items,
    onFilter
  ) {

    const field =
      typeof input ===
      "string"

        ? this.$(
            input
          )

        : input;


    if (!field) {

      return;

    }


    const filter =
      this.debounce(
        () => {

          const query =
            field.value
              .toLowerCase()
              .trim();


          const result =
            items.filter(
              item => {

                return JSON.stringify(
                  item
                )
                  .toLowerCase()
                  .includes(
                    query
                  );

              }
            );


          if (
            typeof onFilter ===
            "function"
          ) {

            onFilter(
              result,
              query
            );

          }

        },
        250
      );


    field.addEventListener(
      "input",
      filter
    );

  },


  /* -----------------------------------------
     INITIALIZE UI STYLES
     ----------------------------------------- */

  injectStyles() {

    if (
      this.$(
        "#jobflow-ui-styles"
      )
    ) {

      return;

    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "jobflow-ui-styles";


    style.textContent = `

      .jobflow-notifications{
        position:fixed;
        top:18px;
        right:18px;
        z-index:99999;
        display:flex;
        flex-direction:column;
        gap:10px;
        max-width:360px;
      }

      .jobflow-notification{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:16px;
        padding:13px 15px;
        border-radius:12px;
        background:#111827;
        color:#fff;
        box-shadow:0 12px 30px rgba(0,0,0,.16);
        font-size:14px;
        animation:jobflowIn .2s ease;
      }

      .jobflow-notification button{
        border:0;
        background:none;
        color:inherit;
        cursor:pointer;
        font-size:20px;
      }

      .jobflow-success{
        border-left:4px solid #16a34a;
      }

      .jobflow-error{
        border-left:4px solid #dc2626;
      }

      .jobflow-warning{
        border-left:4px solid #f59e0b;
      }

      .jobflow-info{
        border-left:4px solid #2563eb;
      }

      .jobflow-modal-overlay{
        position:fixed;
        inset:0;
        z-index:99990;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(15,23,42,.55);
      }

      .jobflow-modal{
        width:min(620px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:18px;
        box-shadow:0 25px 70px rgba(0,0,0,.25);
      }

      .jobflow-modal-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:20px;
        border-bottom:1px solid #e5e7eb;
      }

      .jobflow-modal-header h2{
        margin:0;
        font-size:20px;
      }

      .jobflow-modal-close{
        width:36px;
        height:36px;
        border:0;
        border-radius:10px;
        background:#f3f4f6;
        cursor:pointer;
        font-size:22px;
      }

      .jobflow-modal-body{
        padding:20px;
      }

      .jobflow-modal-actions{
        display:flex;
        justify-content:flex-end;
        gap:10px;
        margin-top:20px;
      }

      .jobflow-progress{
        width:100%;
      }

      .jobflow-progress-top{
        display:flex;
        justify-content:space-between;
        margin-bottom:7px;
        font-size:13px;
      }

.jobflow-progress-track{
  height:8px;
  overflow:hidden;
  border-radius:20px;
  background:#e5e7eb;
}

.jobflow-progress-value{
  height:100%;
  border-radius:20px;
  background:#2563eb;
  transition:width .3s ease;
}

.jobflow-stat-card{
  display:flex;
  align-items:center;
  gap:14px;
  padding:18px;
  border:1px solid #e5e7eb;
  border-radius:16px;
  background:#fff;
}

.jobflow-stat-icon{
  width:42px;
  height:42px;
  display:grid;
  place-items:center;
  border-radius:12px;
  background:#eff6ff;
  color:#2563eb;
  font-weight:700;
}

.jobflow-stat-content{
  display:flex;
  flex-direction:column;
  gap:3px;
}

.jobflow-stat-content span{
  color:#64748b;
  font-size:12px;
}

.jobflow-stat-content strong{
  font-size:24px;
  color:#0f172a;
}

.jobflow-stat-content small{
  color:#94a3b8;
}

.jobflow-badge{
  display:inline-flex;
  align-items:center;
  padding:5px 9px;
  border-radius:999px;
  font-size:12px;
  font-weight:600;
  background:#f1f5f9;
  color:#475569;
}

.jobflow-badge-blue{
  background:#dbeafe;
  color:#1d4ed8;
}

.jobflow-badge-purple{
  background:#ede9fe;
  color:#6d28d9;
}

.jobflow-badge-orange{
  background:#ffedd5;
  color:#c2410c;
}

.jobflow-badge-green{
  background:#dcfce7;
  color:#15803d;
}

.jobflow-badge-red{
  background:#fee2e2;
  color:#b91c1c;
}

.jobflow-empty-state{
  padding:45px 20px;
  text-align:center;
  border:1px dashed #cbd5e1;
  border-radius:16px;
  color:#64748b;
}

.jobflow-empty-icon{
  font-size:32px;
  margin-bottom:8px;
}

.jobflow-empty-state h3{
  margin:0 0 7px;
  color:#0f172a;
}

.jobflow-empty-state p{
  margin:0 0 15px;
}

.jobflow-search{
  display:flex;
  align-items:center;
  gap:8px;
  min-height:42px;
  padding:0 12px;
  border:1px solid #dbe2ea;
  border-radius:11px;
  background:#fff;
}

.jobflow-search input{
  width:100%;
  border:0;
  outline:0;
  background:transparent;
}

.jobflow-table-wrap{
  width:100%;
  overflow-x:auto;
}

.jobflow-table{
  width:100%;
  border-collapse:collapse;
}

.jobflow-table th,
.jobflow-table td{
  padding:12px;
  text-align:left;
  border-bottom:1px solid #e5e7eb;
  white-space:nowrap;
}

.jobflow-table th{
  color:#64748b;
  font-size:12px;
}

.jobflow-table td{
  color:#334155;
  font-size:14px;
}

.jobflow-select{
  min-height:40px;
  padding:0 10px;
  border:1px solid #dbe2ea;
  border-radius:10px;
  background:#fff;
}

.jobflow-loading{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:30px;
  color:#64748b;
}

.jobflow-spinner{
  width:20px;
  height:20px;
  border:3px solid #e2e8f0;
  border-top-color:#2563eb;
  border-radius:50%;
  animation:jobflowSpin .7s linear infinite;
}

@keyframes jobflowSpin{
  to{
    transform:rotate(360deg);
  }
}

@keyframes jobflowIn{
  from{
    opacity:0;
    transform:translateY(-8px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

@media(max-width:600px){

  .jobflow-notifications{
    left:12px;
    right:12px;
    top:12px;
    max-width:none;
  }

  .jobflow-modal-overlay{
    padding:10px;
    align-items:flex-end;
  }

  .jobflow-modal{
    max-height:92vh;
    border-radius:18px 18px 0 0;
  }

  .jobflow-stat-card{
    padding:14px;
  }

  .jobflow-stat-content strong{
    font-size:21px;
  }

}

`;

document.head.appendChild(
  style
);


/* -----------------------------------------
   INITIALIZE
   ----------------------------------------- */

init() {

  this.injectStyles();

}


};


/* Start UI engine */

UIEngine.init();


console.log(
  "JobFlow UI Engine loaded."
);