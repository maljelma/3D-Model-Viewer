const fileInput = document.getElementById('fileInput');
const modelViewer = document.getElementById('modelViewer');

fileInput.addEventListener('change', async function (event) {
    document.getElementById("loaded-models-container").innerHTML = "";
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        modelViewer.src = url;
    }

    Array.from(event.target.files).forEach(f => {
        createModelCard(f);
    });
});


/* create a blob poster(e.i. image) of the 3d model in the given image-file-type(png, webp) */
async function exportPoster(fileType = 'webp') {
    const modelViewer = document.getElementById("modelViewer");

    // use the toBlob method to capture the current model render as a Blob
    const blob = modelViewer.toBlob({ mimeType: `image/${fileType}`, qualityArgument: 0.92, idealAspect: true });

    return blob;
}

/* captures and downloads a blob poster(e.i. image) of the 3d model in the given image-file-type(png, webp) */
async function printModel(fileType) {
    const blob = await exportPoster(fileType);
    download(new File([blob], `poster.${fileType}`));
}

/* ************************** */
/* ** commands ************** */
/* ************************** */

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

function createModelCard(file) {
    const loadedModelsContainer = document.getElementById("loaded-models-container");
    const modelCard = document.querySelector(".model-item.template").cloneNode(true);
    modelCard.classList.remove("selected");
    modelCard.classList.remove("default");
    modelCard.classList.remove("hidden-element");
    const modelCardBackground = modelCard.querySelector(".background");
    modelCardBackground.src = "";
    loadedModelsContainer.appendChild(modelCard);

    modelCardBackground.onclick = async (e) => {
        const modelViewer = document.getElementById("modelViewer");
        const url = URL.createObjectURL(file);
        modelViewer.src = url;

        const selectedCard = document.querySelector(".model-item.selected");
        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }

        modelCard.classList.add("selected");

        if (!modelCardBackground.classList.contains("ready") || true) {
            modelViewer.onload = async () => {
                /* update poster */
                const poster = await exportPoster();
                const bUrl = URL.createObjectURL(poster);
                modelCardBackground.src = bUrl;
                modelCardBackground.classList.add("ready")

                /* clear on-load event callback */
                modelViewer.onload = undefined;
            }
        }
    }
}

/* sample model */
async function loadSampleModel() {
    const modelViewer = document.getElementById("modelViewer");
    const loadedModelsContainer = document.getElementById("loaded-models-container");
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
        loadedModelsContainer.appendChild(card);

        /* when model loaded/drawn capture poster image */
        modelViewer.onload = async () => {
            const posterBlob = await modelViewer.toBlob({ mimeType: `image/webp`, qualityArgument: 0.92, idealAspect: true });
            const posterUrl = URL.createObjectURL(posterBlob);
            card.querySelector('.background').src = posterUrl;
            modelViewer.onload = undefined;
        }
    }
    catch (e) {
        console.log(`${e}`);
    }
}
window.addEventListener("DOMContentLoaded", () => {
    loadSampleModel();
});

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































function createNewCardElement() {
    const card = document.querySelector(".template.model-item").cloneNode(true);
    card.classList.remove("template");
    card.classList.remove("hidden-element");
    return card;
}

function download(file) {
    const link = document.createElement("a");
    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();

    // clean up the URL object
    URL.revokeObjectURL(link.href);
}