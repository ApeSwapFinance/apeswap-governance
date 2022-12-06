## `ApeSwapRoster`

Use this contract to create and manage "members" of a team roster.


Once members are deactivated they cannot be reactivated. A new memberId needs to be created for reactivation.

### `isValidMemberId(string memberId)`

Check if memberId passed has been created





### `isAdminForMember(string memberId, address checkAddress) → bool` (public)

Check if an address is the admin of a Member




### `isActiveMember(string memberId) → bool isActive, uint256 inactiveDate` (public)

Check if a memberId is still an active member of the roster


inactiveDate will return 0 if member is still active


### `getMemberIdsLength() → uint256` (public)

Get the number of memberIds created




### `getActiveSecondsForMember(string memberId, uint256 from, uint256 to) → uint256` (external)

External contracts can use this helper function to estimate pro rata payments




### `setMemberAdmin(string memberId, address newAdminOfMember)` (external)

Allows a member admin to change the admin of their member


This function can also be called by the owner of the roster


### `addMember(string memberId, address memberAdmin)` (external)

Create a new memberId for the roster.




### `deactivateMember(string memberId)` (external)

Deactivate a member by owner (One way operation!)


When a member is deactivated, their inactiveDate is set to the current timestamp



### `AddNewMember(string memberId, address memberAdmin, uint256 startDate)`





### `UpdateMemberAdmin(string memberId, address oldAdmin, address newAdmin)`





### `DeactivateMember(string memberId, uint256 inactiveDate)`






### `Member`


bool isActive


uint256 startDate


uint256 inactiveDate



