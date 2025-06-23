# v.4.4.0

## Module: Tags
* The search template catalogue's search algorithm has been improved.

## Module: Warnings
* The search template catalogue's search algorithm has been improved.

## Module: Hide
* Improved aspect of hide button in Minerva skin.

# v.4.3.0

## Module: Move to sandbox
* Added explanatory reason for move to move summary
* The script will not automatically request for the deletion of the redirected page if the user is not a sysop and thus has no permission to delete it.
* Page title without underscores
* The module is now part of the configuration panel options
* Other minor bug fixes

## Module: Warnings
* Added possibility of adding more than one parameter to templates
* Updated template catalogue

## Module: Tags
* Added possibility of adding more than one parameter to templates
* Updated template catalogue

## Module: Reports
* Added validation for article input field when "edit war" is chosen as motive of the report.
* Added option to hide the reported name when "inappropriate name" is chosen as motive of the report.

## Module: DRM
* In cases where the user chooses to nominate several articles at the same time, the names of the articles will be properly displayed on the request page.

# v.4.2.0

## Module: Move to sandbox
* A new module has been developed. It allows users to easily move a page to a user's sandbox so that they can continue working on it. It is meant to be used with newly published articles that have enciclopedic potential but still need to be worked on.

## Module: Reports
* Fixed a bug whereby the script would incorrectly notify a non-existing user when several users were included in the report.

# v.4.1.0

## Module: Tags
* Fixed a bug whereby the tags with no parameters would not be added to the page.

## Module: Speedy deletion
* Deletion templates added to template namespace pages will now be surrounded by `<noinclude>` tags.

## Module: Warnings
* Users will now not be allowed to submit the form if no templates were selected.
* Fixed a bug whereby the relevant username was not being properly fetched from the dom when using the userlinks option.
* Fixed a bug where templates with no paremeter were not properly being added by the script. 
* The name of the warned person will now be displayed on the form window title.

## Module: Deletion request closer
* A message will appear warning users that beta requests are not processed by Twinkle Lite when trying to close one of them through the DRC module.

## Module: Deletion request maker
* A new option allowing users to open requests in beta mode has been added.
* The script will now properly build cbd2 templates when creating a second request.

# v.4.0.2 (hotfix)

## Module: Warnings
* Fixed a bug whereby the warnings with no parameters would not be added to the page

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

## Module: Hide
* Fixed a bug whereby the «Hide» button would appear twice sometimes.

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