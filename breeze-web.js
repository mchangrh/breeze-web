// https://github.com/jed/weenote
// Licence BSD
let imagePath = ""

function weenoteFit (el) {
    var style = el.style

    let [ i, top, left ] = [ 1000, -1, -1 ]
    style.fontSize = i + "px"

    while (top <= 0 || left <= 0) {
        left = (innerWidth * 0.75) - el.offsetWidth
        top  = (innerHeight * 0.75) - el.offsetHeight
        style.fontSize = (i -= i * 0.05) + "px"
    }
}

const parseImgPath = (text) => (text.startsWith("http://") || text.startsWith("https://")) ? text : imagePath + text

function createSlide(index, BreezeSlide) {
    const presentation = document.getElementById("presentation")
    const slide = document.createElement("div")
    slide.classList.add("slide")
    slide.id = index
    const content = document.createElement("div")
    content.classList.add("content")
    if (BreezeSlide.type === "empty") {
        // do nothing
    } else if (BreezeSlide.type === "image") {
        const img = document.createElement("img")
        img.src = parseImgPath(BreezeSlide.src)
        content.appendChild(img)
    } else if (BreezeSlide.type == "text") {
        const textbox = document.createElement("div")
        textbox.classList.add("textbox")
        textbox.textContent = BreezeSlide.text
        content.appendChild(textbox)
    }
    slide.appendChild(content)
    presentation.appendChild(slide)
}

function setupConfig(config) {
    const presenter = document.getElementById("presentation")
    presenter.style.backgroundColor = config.bg
    presenter.style.color = config.fg
    presenter.style.fontFamily = config.fonts.join(", ")
}

const resize = () => document.querySelectorAll(".textbox").forEach(weenoteFit)

function navigateHash() {
    const slide = document.getElementById(window.location.hash.slice(1))
    if (slide) {
        const current = document.querySelector(".current")
        if (current) current.classList.remove("current")
        slide.classList.add("current")
        slide.scrollIntoView({ behavior: "instant" })
    }
}

function display(presentation) {
    // set up config options
    setupConfig(presentation.config)
    // display the presentation
    for (const [index, slide] of presentation.slides.entries()) {
        createSlide(index, slide)
    }
    resize()
    window.addEventListener("resize", resize)
    // check for anchor links
    navigateHash()
    listenKeys()
}

function paginate(next = true) {
    const slides = document.querySelectorAll(".slide")
    let current = Array.from(slides).findIndex(slide => slide.classList.contains("current"))
    if (current == -1) current = 0
    const nextSlide = slides[current + (next ? 1 : -1)]
    if (nextSlide) {
        slides[current].classList.remove("current")
        nextSlide.classList.add("current")
        nextSlide.scrollIntoView({ behavior: "instant" })
    }
}

function listenKeys() {
    // listen to key events
    const nextKeys = ["ArrowRight", "ArrowDown", "PageDown", "NavigateNext", "Enter", " ", "l", "L", "j", "J", "n", 'N']
    const prevKeys = ["ArrowLeft", "ArrowUp", "PageUp", "NavigatePrevious", "Backspace", "h", "H", "k", "K", "p", 'P']
    window.addEventListener("keydown", event => {
        if (nextKeys.includes(event.key)) {
            event.preventDefault()
            paginate(true)
        } else if (prevKeys.includes(event.key)) {
            event.preventDefault()
            paginate(false)
        }
    })
    // listen to mouse wheel events
    window.addEventListener("wheel", event => {
        event.preventDefault()
        if (event.deltaY > 0) paginate(true)
        else if (event.deltaY < 0) paginate(false)
    }, { passive: false })
    // listen to click events
    window.addEventListener("contextmenu", event => {
        event.preventDefault()
        paginate(false)
    })
    document.addEventListener("click", event => {
        paginate(true)
    })
    // listen to hash changes
    window.addEventListener("hashchange", navigateHash)

}

function load() {
    const input = document.getElementById("url")
    const url = input?.value || input.placeholder
    fetch(url)
        .then(response => response.text())
        .then(text => display(parseFile(text)))
        .catch(error => {
            display({ config: { fg: "red", fonts: ["sans-serif"] }, slides: [{ type: "text", text: error }] })
            console.error(error)
        })
    // set imagepath
    imagePath = url.slice(0, url.lastIndexOf("/") + 1)
    const fileName = url.slice(url.lastIndexOf("/") + 1)
    const deckName = fileName.slice(0, fileName.lastIndexOf("."))
    document.title = `breeze: ${deckName}`
    document.getElementById("load-url").remove()
}