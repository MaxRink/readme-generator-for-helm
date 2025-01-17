/*
* Copyright 2021-2021 VMware, Inc.
* SPDX-License-Identifier: Apache-2.0
*/

const fs = require('fs');
const table = require('markdown-table');

/*
 * Converts an array of objects of the same type to markdown table
 */
function createMarkdownTable(objArray) {
  const modifiedArray = objArray.map((e) => {
    if (e.value === '') {
      e.value = '""';
    }
    return [`\`${e.name}\``, e.description, `\`${e.value}\``];
  });
  // return CliPrettify.prettify((toTable(modifiedArray, ['name', 'description', 'value'])));
  return table([
    ['Name', 'Description', 'Value'],
    ...modifiedArray,
  ]);
}

/*
 * Returns the section rendered
 */
function renderSection(section, lineNumberSigns) {
  let sectionTable = '';
  sectionTable += '\r\n';
  sectionTable += `${lineNumberSigns} ${section[0].section}\r\n\n`; // section header
  sectionTable += createMarkdownTable(section.slice(1)); // section body parameters
  sectionTable += '\r\n\n';
  return sectionTable;
}

/*
 * Returns the README's table as string
 */
function renderReadmeTable(sections, lineNumberSigns) {
  let fullTable = '';
  sections.forEach((section) => {
    fullTable += renderSection(section, lineNumberSigns);
  });
  return fullTable;
}

/*
 * Add table to README.md
 */
function insertReadmeTable(readmeFilePath, sections, config) {
  const data = fs.readFileSync(readmeFilePath, 'UTF-8');
  const lines = data.split(/\r?\n/);
  let lineNumberSigns; // Store section # starting symbols
  const paramsSectionLimits = [];
  lines.forEach((line, i) => {
    // Find parameters section start
    const match = line.match(new RegExp(`^(##+) ${config.regexp.paramsSectionTitle}`)); // use minimun two # symbols since just one is the README title
    if (match) {
      /* eslint-disable prefer-destructuring */
      lineNumberSigns = match[1];
      paramsSectionLimits.push(i);
      console.log(`INFO: Found parameters section at: ${line}`);
    }
  });
  if (paramsSectionLimits.length === 1) {
    // Find parameters section end
    let nextSectionFound = false;
    lines.slice(paramsSectionLimits[0] + 1).forEach((line, i) => {
      const endParamsSectionRegExp = new RegExp('(?!.*\\|).*\\S(?<!\\|.*)(?<!#.*)'); // Match non empty or with non table format lines
      const nextSectionRegExp = new RegExp(`^${lineNumberSigns}\\s`); // Match same level section
      if (!nextSectionFound
        && (line.match(endParamsSectionRegExp) || line.match(nextSectionRegExp))) {
        console.log(`INFO: Found section end at: ${line}`);
        paramsSectionLimits.push(i + paramsSectionLimits[0]);
        nextSectionFound = true;
      } else if (!nextSectionFound && paramsSectionLimits[0] + i + 2 === lines.length) {
        // The parameters section is the last section in the file
        paramsSectionLimits.push(i + paramsSectionLimits[0]);
        nextSectionFound = true;
        console.log('INFO: The paremeters section seems to be the last section in the file');
      }
    });
  }
  if (paramsSectionLimits.length !== 2) {
    throw new Error('ERROR: error getting current Parameters section from README');
  }

  console.log('INFO: Inserting the new table into the README...');
  // Build the table adding the proper number of # to the section headers
  const newParamsSection = renderReadmeTable(sections, `${lineNumberSigns}#`);
  // Delete the old parameters section
  lines.splice(paramsSectionLimits[0] + 1, paramsSectionLimits[1] - paramsSectionLimits[0]);
  // Add the new parameters section
  lines.splice(paramsSectionLimits[0] + 1, 0, ...newParamsSection.split(/\r?\n/));

  fs.writeFileSync(readmeFilePath, lines.join('\n'));
}

module.exports = {
  insertReadmeTable,
};
