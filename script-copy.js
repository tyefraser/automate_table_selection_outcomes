function createEntitySection() {
    const input = document.getElementById('entityInput');
    const entityName = input.value.trim();
    if (entityName) {
        input.value = '';
        const container = document.getElementById('entitySectionsContainer');
        const section = createNewElement('div', 'entity-section');
        const closeButton = createNewElement('button', 'close-button', 'X');
        closeButton.onclick = () => container.removeChild(section);
        const header = createNewElement('h2', '', entityName);

        section.append(closeButton, header);
        setupDynamicDropdown(section, data, entityName);
        container.appendChild(section);
    } else {
        console.error("Empty input for entity name.");
    }
}

function setupDynamicDropdown(parentElement, currentData, entityName) {
    if (!currentData || typeof currentData !== 'object' || currentData.hasOwnProperty('result')) {
        if (currentData?.result) {
            displayResults(parentElement, currentData.result, entityName);
        }
        return;
    }

    Object.entries(currentData).forEach(([key, value]) => {
        const selectionContainer = createNewElement('div', 'selection-container');
        const label = createNewElement('label', '', key + ":");
        const select = createNewElement('select');
        const defaultOption = createNewElement('option', '', 'Select', true);
        select.append(defaultOption);

        Object.keys(value).forEach(subKey => {
            const option = createNewElement('option', '', subKey);
            option.value = subKey;
            select.appendChild(option);
        });

        select.onchange = () => {
            while (selectionContainer.nextSibling) {
                selectionContainer.parentNode.removeChild(selectionContainer.nextSibling);
            }
            setupDynamicDropdown(parentElement, value[select.value], entityName);
        };

        selectionContainer.append(label, select);
        parentElement.appendChild(selectionContainer);
    });
}

function displayResults(parentElement, results, entityName) {
    if (typeof document.createElement !== 'function') {
        console.error('document.createElement has been overwritten');
        return;
    }

    const table = createNewElement('table');
    table.style.width = '100%';
    table.border = '1';

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
    const input = createNewElement('input');
    input.type = 'text';
    input.placeholder = 'Add notes here';
    cell.appendChild(input);
}

// Assume a produceResults function exists and operates as previously discussed
