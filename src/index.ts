import { Button, InfinityParticipant, registerPlugin } from '@pexip/plugin-api'
import { RenameForm } from './forms'

// The participant action button
let renameAction: Button<'participantActions'>

// The list of participants in the conference
let participantsList: InfinityParticipant[] = []

// The participant object of the user itself
let userParticipant: InfinityParticipant

// Register the plugin
const plugin = await registerPlugin({
  id: 'webapp3-rename-participant-plugin',
  version: 0
})

// SSO authenticated participants are not allowed to rename
const getMatchingParticipants = () => {
  return participantsList
    .filter((participant) => participant.isIdpAuthenticated === false)
    .map((p) => p.identity)
}

// The setup object for the participant action
const getSetup = () =>
  ({
    position: 'participantActions',
    label: 'Rename',
    participantIDs: getMatchingParticipants()
  }) as const

// Apply the setup object to the participant action
const applySetup = async () => {
  // If the current user is not a chair, do not show the action
  if (!userParticipant || userParticipant?.role !== 'chair') {
    return
  }

  if (renameAction) {
    // Synchronize the participant action with the latest participants
    await renameAction.update(getSetup())
  } else {
    renameAction = await plugin.ui.addButton(getSetup())

    renameAction.onClick.add(async (clickedParticipant) => {
      const clickedParticipantName =
        participantsList.find(
          (participant) =>
            participant.uuid == clickedParticipant.participantUuid
        )?.overlayText ?? ''

      const input = await plugin.ui.showForm(RenameForm(clickedParticipantName))

      if (input.name) {
        await plugin.conference.setTextOverlay({
          participantUuid: clickedParticipant.participantUuid,
          text: input.name
        })
      }
    })
  }
}

// Initial setup
applySetup()

// Update setup when participants change
plugin.events.participants.add(async ({ participants }) => {
  participantsList = participants
  applySetup()
})

// Get the identity of the current participant
plugin.events.me.add(async (me) => {
  userParticipant = me.participant
})
