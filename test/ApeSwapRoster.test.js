// @ts-ignore
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert, time, ether } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

// Load compiled artifacts
const ApeSwapRoster = contract.fromArtifact('ApeSwapRoster');

const MEMBER_IDS = [
  'MEMBER_1',
  'MEMBER_2',
  'MEMBER_3',
  'MEMBER_4',
  'MEMBER_5',
]

describe('MockToken', function () {
  const [owner, alice, bob, carol, doug, elsie] = accounts;
  
  before(async () => {
    this.roster = await ApeSwapRoster.new({ from: owner });
  });

  it('should allow new member ids to be created', async () => {
    await this.roster.addMember(MEMBER_IDS[0], alice, { from: owner })
    await expectRevert(
      this.roster.addMember(MEMBER_IDS[0], alice, { from: owner }), 'member id already exists'
    );
    assert.equal((await this.roster.adminOfMemberId(MEMBER_IDS[0])), alice);
    assert.equal((await this.roster.detailsOfMemberId(MEMBER_IDS[0])).isActive, true);
    await this.roster.addMember(MEMBER_IDS[1], bob, { from: owner })
    assert.equal((await this.roster.adminOfMemberId(MEMBER_IDS[1])), bob);
    assert.equal((await this.roster.detailsOfMemberId(MEMBER_IDS[1])).isActive, true);
    await this.roster.addMember(MEMBER_IDS[2], carol, { from: owner })
    assert.equal((await this.roster.adminOfMemberId(MEMBER_IDS[2])), carol);
    assert.equal((await this.roster.detailsOfMemberId(MEMBER_IDS[2])).isActive, true);
  });

  it('should allow member to update address', async () => {
    await this.roster.setMemberAdmin(MEMBER_IDS[0], doug, { from: alice });
    assert.equal((await this.roster.adminOfMemberId(MEMBER_IDS[0])), doug);
    await expectRevert(
      this.roster.setMemberAdmin(MEMBER_IDS[0], doug, { from: alice }), 'only callable by member admin or owner'
    );

    // Increase timestamp time to see active seconds
    time.increase(10);

    await this.roster.deactivateMember(MEMBER_IDS[0], { from: owner });
    assert.equal((await this.roster.detailsOfMemberId(MEMBER_IDS[0])).isActive, false);

    // console.dir((await this.roster.isActiveMember(MEMBER_IDS[0])).inactiveDate.toString())
    let activeState = await this.roster.isActiveMember(MEMBER_IDS[0]);
    var date = new Date(Number(activeState.inactiveDate.toString() + '000'));
    console.log(date);

    console.log((await this.roster.getActiveSecondsForMember(MEMBER_IDS[0], '0', '999999999999')).toString());
  });
});
