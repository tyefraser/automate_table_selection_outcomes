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
    if (!currentData || typeof currentData !== 'object') return; // Stop if no further data

    const select = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.textContent = "Select";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    Object.keys(currentData).forEach(key => {
        if (key !== "result") {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            select.appendChild(option);
        }
    });

    select.onchange = () => {
        while (select.nextSibling) {
            select.parentNode.removeChild(select.nextSibling);
        }
        setupDynamicDropdown(select.parentNode, currentData[select.value], entityName);
    };

    parentElement.appendChild(select);
}

function produceResults() {
    const results = [];
    const sections = document.querySelectorAll('.entity-section');
    sections.forEach(section => {
        const selects = section.querySelectorAll('select');
        const entityResults = Array.from(selects).map(select => select.value).filter(val => val !== "Select");
        results.push({
            entity: section.firstChild.textContent, // Assuming the entity name is stored as the first child (header)
            selections: entityResults
        });
    });

    console.log(results); // For now, just logging the results
    // Later, implement Excel generation from 'results'
}

