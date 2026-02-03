

- including a searchNonce counter that is meant to ask the system to send another api call if the filters are the same. Doing this because while bank data is volatile and new purchases can be made whenever, I am including a sync now button in the system to update the data when expected because otherwise this could be an expensive call with no need. The data will also be synced if the landing page is refreshed.

- only redo queryString when search button is pressed

- right now the project can handle responsive database filters since there is not much data and only a certain amount can be seen on the web page.









