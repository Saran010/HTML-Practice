(() => {
  const debounce = (f, ms) => {
    let isCooldown = false;
    return function() {
      if (isCooldown) return;
      f.apply(this, arguments);
      isCooldown = true;
      setTimeout(() => (isCooldown = false), ms);
    };
  };

  const tableOfContents = () => {
    const contents = document.getElementById("contents").querySelector("ul");
    const articles = document.querySelectorAll("article");
    articles.forEach(article => {
      const id = article.id;
      if (id) {
        const title = article.querySelector("h2").textContent;
        const anchor = document.createElement("a");
        anchor.setAttribute("href", "#" + id);
        anchor.innerText = title;
        const listItem = document.createElement("li");
        listItem.appendChild(anchor);
        contents.appendChild(listItem);
      }
    });

    const main = document.querySelector("main");
    const mainMenu = document.getElementById("menu");
    mainMenu.innerHTML = contents.innerHTML;

    if (window.innerWidth > 1300) {
      const debouncedScroll = debounce(() => {
        articles.forEach(article => {
          const activeArticle = mainMenu.querySelector(`[href="#${article.id}"]`);
          if (window.scrollY > article.offsetTop - window.innerHeight / 2) {
            mainMenu.querySelectorAll(".active").forEach(a => {
              a.classList.remove("active");
            });
            activeArticle.classList.add("active");
            if (document.location.hash !== "#" + article.id) {
              history.pushState(null, null, "#" + article.id);
            }
          } else {
            activeArticle.classList.remove("active");
          }
        });
      }, 500);

      window.addEventListener("scroll", () => {
        debouncedScroll();
      });
    }

    let withoutMenu = !!localStorage.getItem("menu-switch-button");
    if (withoutMenu) {
      main.classList.add("without-menu");
    }
    document.getElementById("menu-switch-button").addEventListener("click", () => {
      main.classList.toggle("without-menu");
      withoutMenu = !withoutMenu;
      localStorage[withoutMenu ? "setItem" : "removeItem"]("menu-switch-button", "true");
    });
  };

  const runCode = () => {
    const iframes = new Map();

    document.querySelectorAll("[data-code]").forEach((pre: HTMLPreElement) => {
      const id = pre.dataset.code;
      const type = pre.dataset.lang;
      if (!iframes.has(id)) {
        iframes.set(id, {});
      }
      const item = iframes.get(id);
      item[type] = (item[type] || "") + pre.innerText;
    });

    document.querySelectorAll("[data-run]").forEach((div: HTMLDivElement) => {
      if (div.dataset.height) {
        div.style.height = div.dataset.height;
      }
      if (iframes.has(div.dataset.run)) {
        const code = iframes.get(div.dataset.run);
        div.attachShadow({ mode: "open" });
        div.shadowRoot.innerHTML = `
        <style>
          ${code.css || ""}
        </style>
        ${code.html || ""}
        `;
      }
    });
  };

  const highlight = () => {
    document.querySelectorAll("pre[data-lang]:not([hidden])").forEach((block: HTMLPreElement) => {
      const lang = block.dataset.lang;
      lang && block.classList.add(lang);
      // @ts-ignore
      hljs.highlightBlock(block);
    });
  };

  const initYoutube = () => {
    document.querySelectorAll(".youtube").forEach((block: HTMLAnchorElement) => {
      const id = block.dataset.video;
      const link = "https://www.youtube.com/watch?v=" + id;
      const src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";

      const anchor = document.createElement("a");
      anchor.setAttribute("href", link);

      const image = document.createElement("img");
      image.setAttribute("alt", "YouTube");
      image.setAttribute("src", src);

      anchor.appendChild(image);
      block.appendChild(anchor);

      anchor.addEventListener("click", e => {
        e.preventDefault();

        const iframe = document.createElement("iframe");
        iframe.setAttribute("src", "https://www.youtube.com/embed/" + id + "?autoplay=1");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "true");
        iframe.classList.add("aspect16-9", "no-print");

        block.removeChild(anchor);
        block.appendChild(iframe);
      });
    });
  };

  const initCodePen = () => {
    document.querySelectorAll(".codepen").forEach((pen: HTMLDivElement) => {
      const id = pen.dataset.id;
      pen.innerHTML = pen.innerHTML || `Run Pen`;
      pen.setAttribute("href", "https://codepen.io/artik-man/pen/" + id);
      pen.setAttribute("target", "_blank");
      pen.addEventListener("click", event => {
        pen.dataset.height = pen.dataset.height || "300";
        pen.dataset.themeId = pen.dataset.themeId || "dark";
        pen.dataset.defaultTab = pen.dataset.defaultTab || "css,result";
        pen.dataset.preview = pen.dataset.preview || "false";
        pen.dataset.user = pen.dataset.user || "artik-man";
        pen.dataset.penTitle = pen.dataset.penTitle || id;
        pen.dataset.slugHash = pen.dataset.slugHash || id;
        pen.dataset.editable = pen.dataset.editable || "editable";

        const span = document.createElement("span");
        span.innerHTML = `See the Pen <a href="https://codepen.io/artik-man/pen/${id}/"> ${id} </a> 
          by Artik (<a href="https://codepen.io/artik-man">@artik-man</a>) on <a href="https://codepen.io">CodePen</a>.`;
        pen.appendChild(span);
        pen.insertAdjacentHTML(
          "beforebegin",
          `<a class="print-only" href="https://codepen.io/artik-man/pen/${id}/" target="_blank">Посмотреть задачу</a>`
        );
        try {
          // @ts-ignore
          __CPEmbed(pen);
          event.preventDefault();
        } catch (e) {
          pen.removeChild(span);
          console.warn("Can not initialize CodePen");
        }
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    try {
      tableOfContents();
    } catch (e) {
      console.warn(e);
    }

    try {
      runCode();
    } catch (e) {
      console.warn(e);
    }

    try {
      highlight();
    } catch (e) {
      console.warn(e);
    }

    try {
      initYoutube();
    } catch (e) {
      console.warn(e);
    }

    try {
      initCodePen();
    } catch (e) {
      console.warn(e);
    }
  });
})();