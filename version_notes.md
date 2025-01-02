# v.4.0.0

## Global enhancements
* A refactoring of the entire project from Javascript to TypeScript has been carried out.
* Testing with Jest has been added to the project.

## Module: Config
* A new module has been added allowing users to customize which Twinkle Lite options show up.

## Module: Deletion request closer
* A new sysop-exclusive module has been added to quicken the proccess of closing a deletion request (not compatible with beta deletion requests).

## Module: Block appeals
* A new sysop-exclusive module has been added to more easily proccess block appeals.

## Module: fast blocker
* The fast-blocker script has been integrated as part of Twinkle Lite.

## Module: Tags
* Fixed bug whereby the script created the wrong talk page when adding tags to anexo pages.

# v.3.1.0

## Module: Speedy deletion
* Fixed a bug whereby the script would find the creator of the main page when adding deletion templates to talk pages.

## Module: Tags
* Templates will now be grouped up if they can be used under the «problemas artículo» template.
* The script will now appropriately use "sust:" before introducing the template only when necessary according to each template's documentation.
* The script will now appropriately use "sust:" when group up templates under the {{problemas artículo}} template

# v.3.0.0

## Global enhacements
* Many of the modules will now simply close morebit's windows after submitting the form instead of refreshing the page every time. The latter will only happen if a change on the current page the user is in has been made.
* User window will now stay in place instead of scrolling up when opening morebits Windows
* Improved error management across all modules.

## Module: Hide
* __The mode that creates edit hide reports has been implemented__. It will show as an option on diff pages.

## Module: Reports
* An option to report users from their user link in watchlist, recent changes, diff and page history pages will now be avilable. Upon clicking, the form will complete the input name of the reported user with the corresponding one. It works in mobile view too.
* Fixed a bug whereby the link that is part of the notification on the reported user's talk page would not take to the right report in the relevant board if other reports with the same name were already present.
* When reporting through VEC, a link to the user's contribution page will now be available on the reporter's edit summary.

## Module: Warnings
* An option to warn users from their user link in watchlist, recent changes, diff and page history pages will now be avilable, similar to the implementation in the reports module described above.
* The `{{tradref}}` template has now been added to available templates catalogue.

## Module: Speedy deletion
* The script will now check whether a speedy deletion demplate already exists in the article and prompt the user to confirm the action before continuing.

## Module: Protection
* The expiry time of the protection will now be shown when opening the module window.
* The window will now appropriately display edit protection (it used to not be able to distinguish between edit and move protection).

## Module: Tags
* Templates posted on talk pages will now not add «sust» at the beginning.

# v.2.3.0

## Global enhacements
* Most confirmation messages have been removed to enhance quickness of the script.

## Module: Page protection
* The default title of the protection request will now be the title of the potentially protected article (as per current implicit consensus in this direction).
* If no reason has been developed by the repoting user in the «Reason» field, instead of preventing the form from being sent, the script will now use the selected motive in the drop-down list to fill the field except when the selected option is «Other».

## Module: Reports
* The reason field will now be optional for several of the available motives, namely «CCV», «nombre inapropiado» and «vandalismo persistente».
* The _add_ and _remove_ labels that list articles when choosing the _edit war_ report motive will now be correctly displayed in Spanish.

## Module: Tags
* The module will now allow users to tag templates that go in talk pages, such as the «pr» template.
* Added `{{traducción}}` template to the list of available templates.

## Module: Warnings
* Fixed wrong description for the «Aviso guerra de ediciones» template.

## Module: Speedy deletion
* Fixed a bug whereby the A1 criterion would not be included in the deletion template even when none of its subcriteria had been included.

## Module: Deletion Request Maker
* A functionality that allows more than one article to be included in the same deletion request has been added.
* The bottom-right form link will now take the to deletion request policy instead of the deletion policy.

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