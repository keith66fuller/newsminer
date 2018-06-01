# Description
AS A...book editor.
I WANT...a function that will give me a title according to the AP style guide.
SO THAT...I don't have to think about it and have books titled automatically.

# Acceptance criteria
-GIVEN...that I have a title with numbers in it
WHEN...I convert to a title
THEN...the number is unchanged.

-GIVEN...that I have a lowercase word in my title
WHEN...I convert to a title
THEN the first letter of the word will be capitalized.

-GIVEN...that I have a word that has upper and lowercase letters
WHEN...I convert to a title
THEN...only the first letter of the word is converted to uppercase.

-GIVEN...that I have a preposition or other small word that I don't want capitalized
WHEN...I convert to a title
AND...it is not the first word
THEN...that word will not be capitalized.