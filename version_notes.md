# v.2.2.0

## Module: Tags
* Fixed a bug where TL would create a blank talk page if the option to notify users was selected but no warning templates were associated to the chosen template(s) and the warned author's TP had not been previously created.
* Added the `{{bulo}}` template to the dictionary. 

## Module: Speedy deletion
* The speedy deletion A1 criterion will not be included as part of the deletion template if any of its subcriteria have been selected.

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