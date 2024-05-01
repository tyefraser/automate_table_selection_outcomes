document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('entityInput').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            createEntitySection();
            event.preventDefault(); // Prevent form submission
        }
    });
});

function createEntitySection() {
    const input = document.getElementById('entityInput');
    const entityName = input.value.trim();
    if (entityName) { // Ensure the input is not empty
        input.value = ''; // Clear input for next entry
        const container = document.getElementById('entitySectionsContainer');

        const section = document.createElement('div');
        section.className = 'entity-section';
        section.style.border = "1px solid #ccc";
        section.style.margin = "10px";
        section.style.padding = "10px";
        section.style.position = "relative";

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.right = '10px';
        closeButton.onclick = function() {
            container.removeChild(section);
        };
        section.appendChild(closeButton);

        // Create the header
        const header = document.createElement('h2');
        header.textContent = entityName;
        section.appendChild(header);

        setupDynamicDropdown(section, data, entityName); // Initial dropdown setup
        container.appendChild(section);
    } else {
        console.error("Empty input for entity name.");
    }
}

function setupDynamicDropdown(parentElement, currentData, entityName) {
    if (!currentData || typeof currentData !== 'object' || Object.keys(currentData).includes("result")) {
        if (currentData && currentData.result) {
            displayResults(parentElement, currentData.result, entityName);
        }
        return; // Stop if no further data or reached a result
    }

    Object.entries(currentData).forEach(([key, value]) => {
        // Create a container for each selection level
        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Create a descriptive label
        const label = document.createElement('label');
        label.textContent = key + ":";
        selectionContainer.appendChild(label);

        // Create the dropdown for the current context
        const select = document.createElement('select');
        const defaultOption = document.createElement('option');
        defaultOption.textContent = "Select";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        Object.keys(value).forEach(subKey => {
            const option = document.createElement('option');
            option.value = subKey;
            option.textContent = subKey;
            select.appendChild(option);
        });

        // Handle changes in selection
        select.onchange = () => {
            // Remove all subsequent sibling elements of the selectionContainer
            while (selectionContainer.nextSibling) {
                selectionContainer.parentNode.removeChild(selectionContainer.nextSibling);
            }
            // Setup the new dropdown based on the selected value
            setupDynamicDropdown(parentElement, value[select.value], entityName);
        };

        selectionContainer.appendChild(select);
        parentElement.appendChild(selectionContainer);
    });
}


function displayResults(parentElement, resultArray, entityName) {
    // This function can display results or store them for later use
    const resultsDiv = document.createElement('div');
    resultsDiv.textContent = "Results for " + entityName + ": " + resultArray.join(", ");
    parentElement.appendChild(resultsDiv);
}


function produceResults() {
    const entityDetails = [];
    const selectionPaths = [];
    const sections = document.querySelectorAll('.entity-section');
    
    // Iterate over each section to collect results
    sections.forEach(section => {
        const selects = section.querySelectorAll('select');
        const entityResults = Array.from(selects).map(select => select.value);
        const documents = entityResults[entityResults.length - 1]; // Assuming last selection contains the documents
        const entityName = section.querySelector('h2').textContent;

        // For Sheet 1
        entityDetails.push({
            Entity: entityName,
            Status: "Not Started", // Default status
            Documents: documents,
            Notes: "" // Empty notes for user input
        });

        // For Sheet 2
        selectionPaths.push({
            Entity: entityName,
            Selections: entityResults.join(" > ") // Path of selections made
        });
    });

    // Create workbook and sheets
    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(entityDetails);
    const ws2 = XLSX.utils.json_to_sheet(selectionPaths);

    // Append worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, "Entity Documents");
    XLSX.utils.book_append_sheet(wb, ws2, "Selection Paths");

    // Write workbook
    XLSX.writeFile(wb, "EntityDocuments.xlsx");
}

