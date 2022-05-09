# medicalStoreLocator

---- Intro

We all know that one has to go to a medical store to buy medicines. 
Sometimes, we visit many stores just to know that the medicine required is not available.
Yes, we can order medicines online. But, what if its an emergency?
This is the reason I have chosen a project where all the nearby medical stores which have the medicine required by the user is available at that time.

---- Login Page

<img width="1440" alt="Screenshot 2022-04-29 at 00 37 02" src="https://user-images.githubusercontent.com/75008644/167336359-5b273589-0ffd-4a9d-b819-5f8052449d2c.png">

There are two logins, one for medical store admins and other for users. 

---- Sign up pages

createAccount1.html and createAccount2.html are the sign up pages for user and medical store respectively.


---- What can a user do? 


Immediately after log in, the user will have a nav bar and button called "Locate nearby stores".

He/she can also update their profile.

<img width="1440" alt="Screenshot 2022-04-29 at 00 37 09" src="https://user-images.githubusercontent.com/75008644/167336683-a095fce6-2ccf-4875-b347-4bfb9e3706f0.png">
<img width="1440" alt="Screenshot 2022-04-29 at 00 37 32" src="https://user-images.githubusercontent.com/75008644/167336894-2043db8e-3dbb-49a0-9297-38d6f1571888.png">

After clicking on the button, all the nearby medical stores within a range of 5kms will be listed along with some details. 
A search bar will also be present, where a medicine name can be entered, and the store list below will be updated and only those stores having that
particular medicine will be displayed.

There will be a hyperlink called "Get Direction" for each store. This will redirect the user to google maps to get directions to the desired store.

<img width="1440" alt="Screenshot 2022-04-29 at 00 37 21" src="https://user-images.githubusercontent.com/75008644/167336874-9cf5d3bd-4c93-4f58-9b5c-59ecbbb4d77e.png">


----- What can a medical store admin do?

The medicines are divided into classes like analgesics, antipyretics, antidotes, etc. for the ease of searching.

He/she can update the store's profile.
He/she can delete medicines. He/she can also add new medicines to their list.

<img width="1440" alt="Screenshot 2022-04-29 at 00 38 59" src="https://user-images.githubusercontent.com/75008644/167337239-43c2e364-bc58-4607-bd21-0549db938261.png">


---- Working of the website....

When a user clicks on "Locate nearby stores", I take his current location using the navigator.getlocation() available in js. Then I use mongoose's 2d-sphere indexing to find alll the nearby medical stores within a range of 5kms and display them accordingly. The lat and long pair of each store is available in the databse.

When a user enters a medicine name in the search bar and clicks on submit, I use lodash to convert it all lowercase, trim the spaces, dashes, etc. and then search the nearby medical stores only if they have that particular medicine. 
