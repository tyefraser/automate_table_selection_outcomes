document.addEventListener('DOMContentLoaded', () => {
    // Setup to create new entity sections upon pressing "Enter"
    document.getElementById('entityInput').addEventListener('keypress', function(event) {
        if (event.key === "Enter") {
            createEntitySection();
            event.preventDefault(); // Prevent form submission
        }
    });

    // Setup to handle close button clicks within the container
    document.getElementById('entitySectionsContainer').addEventListener('click', function(event) {
        if (event.target.className === 'close-button') {
            event.target.parentElement.remove(); // Remove the section
        }
    });    
});

function createEntitySection() {
    const input = document.getElementById('entityInput');
    const entityName = input.value.trim();
    if (entityName) {
        // Clear input for next entry
        input.value = ''; 

        // Select the entitySectionsContainer section to add in details below
        const container = document.getElementById('entitySectionsContainer');

        // Create the entity section for the new entity
        const section = document.createElement('div');
        section.className = 'entity-section';

        // Create the close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.textContent = 'X';
        closeButton.onclick = () => container.removeChild(section);
        section.appendChild(closeButton);

        // Create the header
        const header = document.createElement('h2');
        header.textContent = entityName;
        section.appendChild(header);

        // Start the dropdown setup
        setupDynamicDropdown(section, data, entityName);
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
        return;
    }

    Object.entries(currentData).forEach(([key, value]) => {
        // Log key value pairs for visibility
        console.log(`Key: ${key}`);
        console.log(`Value: ${value}`);

        // Create div section for current selection
        const selectionContainer = document.createElement('div');
        selectionContainer.className = 'selection-container';

        // Add in label for the current selection
        const label = document.createElement('label');
        label.textContent = key + ":";
        selectionContainer.appendChild(label);

        // Add in selection element to use with drop down
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

        select.onchange = () => {
            while (selectionContainer.nextSibling) {
                selectionContainer.parentNode.removeChild(selectionContainer.nextSibling);
            }
            setupDynamicDropdown(parentElement, value[select.value], entityName);
        };

        selectionContainer.appendChild(select);
        parentElement.appendChild(selectionContainer);
    });
}

function displayResults(parentElement, results, entityName) {
    if (typeof document.createElement !== 'function') {
        console.error('document.createElement has been overwritten');
        return;
    }

    const table = createNewElement('table');

    const thead = createNewElement('thead');
    const tbody = createNewElement('tbody');
    table.append(thead, tbody);

    const row = createNewElement('tr');
    ["Category", "Document", "Status", "Notes"].forEach(text => {
        const header = createNewElement('th', '', text);
        row.appendChild(header);
    });
    thead.appendChild(row);

    ["application", "id"].forEach(category => {
        ["A", "B", "C"].forEach(document => {
            const row = createNewElement('tr');
            appendCell(row, category);
            appendCell(row, document);
            appendStatusCell(row);
            appendNotesCell(row);
            tbody.appendChild(row);
        });
    });

    parentElement.appendChild(table);
}

function createNewElement(tag, className='', textContent='', disabled=false) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    if (disabled) element.disabled = true;
    return element;
}

function appendCell(row, text) {
    const cell = row.insertCell();
    cell.textContent = text;
}

function appendStatusCell(row) {
    const cell = row.insertCell();
    const select = createNewElement('select');
    ["Not Started", "Requested", "Received", "Processed"].forEach(status => {
        const option = createNewElement('option', '', status);
        select.appendChild(option);
    });
    cell.appendChild(select);
}

function appendNotesCell(row) {
    const cell = row.insertCell();
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Add notes here';
    textarea.rows = 4;  // Set the visible number of lines in the textarea
    cell.appendChild(textarea);
}


function produceResults() {
    const entitySections = document.querySelectorAll('.entity-section');
    const entityDetails = [];
    const entityPaths = [];

    entitySections.forEach(section => {
        const entityName = section.querySelector('h2').textContent;  // Get the entity name from the header
        const tables = section.querySelectorAll('table');
        const path = [];

        // Capture each selection made in dropdowns leading to the table
        section.querySelectorAll('.selection-container select').forEach(select => {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.value !== "Select") {
                path.push(selectedOption.textContent);
            }
        });

        // Store the path per entity
        entityPaths.push({
            Entity: entityName,
            Path: path.join(" > ")  // Combine the path choices into a single string
        });

        // Extract data from tables for Excel
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                // Use the correct query to get the value from the select dropdown
                const category = row.cells[0].textContent;
                const documentName = row.cells[1].textContent;
                const status = row.cells[2].querySelector('select').value; // Ensure the correct element is targeted
                const notes = row.cells[3].querySelector('textarea').value; // Corrected to use textarea instead of input

                entityDetails.push({
                    Entity: entityName,
                    Category: category,
                    Document: documentName,
                    Status: status,
                    Notes: notes,
                    // Path: path.join(" > ")  // Include path in details for reference
                });
            });
        });
    });

    // Create Excel workbook and add the data
    const workbook = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(entityDetails);
    const ws2 = XLSX.utils.json_to_sheet(entityPaths, { header: ["Entity", "Path"] });  // Optional: Create a separate sheet for paths
    XLSX.utils.book_append_sheet(workbook, ws1, "Entity Documents");
    XLSX.utils.book_append_sheet(workbook, ws2, "Selection Paths");
    XLSX.writeFile(workbook, "EntityDocuments.xlsx");
}
