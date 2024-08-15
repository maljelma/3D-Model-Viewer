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

function download(file) {
    const link = document.createElement("a");
    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();

    // clean up the URL object
    URL.revokeObjectURL(link.href);
}

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


/* show default poster */
/* window.addEventListener("DOMContentLoaded", () => {
    const modelViewer = document.getElementById("modelViewer");
    modelViewer.onload = async () => {
        // update poster
        const poster = await exportPoster();
        const url = URL.createObjectURL(poster);
        const defaultModelBackground = document.querySelector(".model-item.template").querySelector(".background");
        defaultModelBackground.src = url;

        // clear on-load event callback
        modelViewer.onload = undefined;
    }

}); */

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