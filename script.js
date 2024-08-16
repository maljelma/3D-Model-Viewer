/* load model(s) */
(() => {
    const fileInput = document.getElementById('fileInput');
    const modelViewer = document.getElementById('modelViewer');
    const modelPrinter = document.getElementById('posterModel');
    const modelsCardsContainer = document.getElementById("loaded-models-container");

    modelsCardsContainer.EventQueue = new EventQueue(modelsCardsContainer, 'card-created', async (e) => {
        const { card, modelURL } = e.detail;
        const poster = await printModel(modelURL);
        card.querySelector('.background').src = poster;
    });

    fileInput.addEventListener('change', async function (event) {
        Array.from(event.target.files).forEach(f => {
            const card = createNewCardElement();
            const modelURL = URL.createObjectURL(f);
            createCard(card, modelURL);
        });
        fileInput.value = '';
    });
    function createCard(card, modelURL) {
        /* set event handlers */
        card.querySelector('.background').onclick = () => showModel(card, modelURL);
        card.querySelector('.remove-command').onclick = () => deleteModel(card, modelURL);
        /* add card container */
        modelsCardsContainer.appendChild(card);
        /* dispatch a 'card-created' event to add card to queue to create a poster for it */
        modelsCardsContainer.dispatchEvent(new CustomEvent('card-created', { detail: { card, modelURL } }));
    }
    function showModel(modelCard, modelURL) {
        const selected = modelsCardsContainer.querySelector('.selected');
        if (selected != modelCard) {
            if (selected) { selected.classList.remove('selected'); }
            modelViewer.dispatchEvent(new Event("load-started"));
            modelViewer.src = modelURL;
            modelCard.classList.add('selected');
        }
        if (modelViewer.classList.contains('no-model')) {
            modelViewer.classList.remove('no-model');
        }
    }
    function deleteModel(modelCard, modelURL) {
        const selected = modelsCardsContainer.querySelector('.selected');
        URL.revokeObjectURL(modelURL);
        modelCard.remove();
        if (selected == modelCard) {
            const firstCard = modelsCardsContainer.children[0];
            if (firstCard) {
                firstCard.querySelector('.background').click();
            }
            else {
                modelViewer.classList.add('no-model');
            }
        }
    }
    async function printModel(modelURL) {
        modelPrinter.src = modelURL;
        return new Promise((resolve, reject) => {
            modelPrinter.onload = async () => {
                const posterBlob = await modelPrinter.toBlob({ mimeType: `image/webp`, qualityArgument: 0.92, idealAspect: true });
                const posterUrl = URL.createObjectURL(posterBlob);
                modelViewer.onload = undefined;
                resolve(posterUrl);
            }
        });
    }

    function createNewCardElement() {
        const card = document.querySelector(".template.model-item").cloneNode(true);
        card.classList.remove("template");
        card.classList.remove("hidden-element");
        return card;
    }

    /* create sample model */
    window.addEventListener("DOMContentLoaded", async () => {
        const modelViewer = document.getElementById("modelViewer");
        try {
            /* load sample-model to model-viewer */
            const sampleModel = await fetch('./models/sample.glb');
            const blob = await sampleModel.blob();
            const url = URL.createObjectURL(blob);

            modelViewer.dispatchEvent(new Event("load-started"));
            modelViewer.src = url;

            /* create a model-poster card */
            const card = createNewCardElement();
            card.classList.add("sample");
            card.classList.add("selected");

            /* create model-card */
            createCard(card, url);
        }
        catch (e) {
            console.log(`${e}`);
        }
    });
})();

/* ************************** */
/* ** commands ************** */
/* ************************** */
/* create a blob poster(e.i. image) of the 3d model in the given image-file-type(png, webp) */
async function exportPoster(fileType = 'webp') {
    const modelViewer = document.getElementById("modelViewer");

    // use the toBlob method to capture the current model render as a Blob
    const blob = modelViewer.toBlob({ mimeType: `image/${fileType}`, qualityArgument: 0.92, idealAspect: true });

    return blob;
}

/* open file(s) picker */
const openFilesCommand = document.getElementById("open-files-command");
document.getElementById("open-files").addEventListener('click', () => {
    openFilesCommand.click();
});

/* show/hide commands */
const commandsContainer = document.getElementById("commands-container");
const loadedModelsContainer = document.getElementById("loaded-models-container");
const toggleCommandsVisibility = document.getElementById("toggle-commands-visibility");
toggleCommandsVisibility.addEventListener("click", () => {
    if (toggleCommandsVisibility.classList.contains('on')) {
        toggleCommandsVisibility.classList.remove('on');
        toggleCommandsVisibility.classList.add('off');
        commandsContainer.classList.add("hidden-element");
        loadedModelsContainer.classList.add("hidden-element");

    }
    else {
        toggleCommandsVisibility.classList.add('on');
        toggleCommandsVisibility.classList.remove('off');
        commandsContainer.classList.remove("hidden-element");
        loadedModelsContainer.classList.remove("hidden-element");
    }
});

/* captures and downloads a blob poster(e.i. image) of the 3d model in the given image-file-type(png, webp) */
async function printViewModel(fileType) {
    const blob = await exportPoster(fileType);
    download(new File([blob], `poster.${fileType}`));
}
document.getElementById('print-model').onclick = () => printViewModel('png');

/* show/hide loading on view-model loading */
(() => {
    const modelViewer = document.getElementById("modelViewer");
    const modelLoadingIndicator = document.getElementById('modelLoadingIndicator');
    modelViewer.addEventListener('load', () => {
        modelLoadingIndicator.classList.add('hidden-element');
    });
    modelViewer.addEventListener('load-started', () => {
        modelLoadingIndicator.classList.remove('hidden-element');
    });
})();

function download(file) {
    const link = document.createElement("a");
    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();

    // clean up the URL object
    URL.revokeObjectURL(link.href);
}

/* dispatch events for embedded-AR-[on, off](in browser AR) */
(() => {
    function onFullScreenChange() {
        if (document.fullscreenElement) {
            document.dispatchEvent('embedded-ar-on');
        }
        else {
            document.dispatchEvent('embedded-ar-off');
        }
    }
    // Adding event listeners for different browsers
    document.addEventListener("fullscreenchange", onFullScreenChange);
})();