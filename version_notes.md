# v.2.3.0

## Global enhacements
* Confirmation messages have been removed to enhance quickness of the script.

## Module: Page protection
* The default title of the protection request will now be the title of the potentially protected article (as per current implicit consensus in this direction).
* If no reason has been developed by the repoting user in the «Reason» field, instead of preventing the form from being sent, the script will now use the selected motive in the drop-down list to fill the field except when the selected option is «Other».

## Module: Reports
* The reason field will now be optional for several of the available motives, namely «CCV», «nombre inapropiado» and «vandalismo persistente».
* The _add_ and _remove_ labels that list articles when choosing the _edit war_ report motive will now be correctly displayed in Spanish.

## Module: Tags
* Added `{{traducción}}` template to the list of available templates.

## Module: Warnings
* Fixed wrong description for the «Aviso guerra de ediciones» template.

# v.2.2.0

## Global enhacements
* Punctuation in edit summaries has been standardized.
* Added a check to prevent double loading of the script.

## Module: Tags
* Fixed a bug where TL would create a blank talk page if the option to notify users was selected but no warning templates were associated to the chosen template(s) and the warned author's TP had not been previously created.
* Added the `{{bulo}}` template to the dictionary.
* Introduced input boxes for «sin relevancia» and «promocional» templates that allow the parameter «motivo» of the template to be filled in with relevant information. 

## Module: Reports
* There's now an option to report SPAs (In Spanish: CPPs) through the reports module.
* The notification message after reporting a user will now include a link that takes to the right post within the noticeboard when reporting "Vandalismo en curso".

## Module: Speedy deletion
* The speedy deletion A1 criterion will not be included as part of the deletion template if any of its subcriteria have been selected.
* Article criteria will now work for Anexos as well.

## Module: Deletion request maker
* The script will now identify if an old or current deletion discussion page exists and, if it's the case of the former, the user will be asked to confirm the opening of a second deletion request. When agreed upon, the script will create a new deletion request in a new page with `(segunda consulta)` appended to the title.

# v.2.1.0

## Global enhancements
* Edit summaries have now been given the right punctuation

## Module: Warnings

* __The warning module has been implemented__

## Module: Speedy deletion
* The speedy deletion module will now specify the original, better-quality article in the edit summary when selecting the A5 criteria.
# v.2.0.0

## Global enhancements

* Removed testing comments.
* The tool will now load the dependencies as part of a series of callbacks to ensure it happens in the right order.

## Module: Tags

* __The article tagging module has been implemented in Twinkle Lite__

## Module: Deletion request maker

* Fixed summary edits that incorrectly attributed the name «Deletion Request Maker» to the script.

## Module: Reports

* The option that allows TL to notify the reported user will now be unchecked by default.
* Translated the names of the user add/remove labels into Spanish.

## Module: Page protection

* The script will now recognize pages that have "template editor" protection level.
* The "request protection removal" radio button will now be disabled in unprotected pages.