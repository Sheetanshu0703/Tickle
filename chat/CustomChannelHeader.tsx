import { UserResource } from "@clerk/types";
import {
  ChannelHeader,
  ChannelHeaderProps,
  useChannelActionContext,
  useChannelStateContext,
} from "stream-chat-react";
import { Bell, BellOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function CustomChannelHeader(props: ChannelHeaderProps) {
  const { user } = useUser();

  const {
    channel: { id: channelId },
  } = useChannelStateContext();

  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#17191c]">
      <ChannelHeader {...props} />
      {user && channelId && (
        <ChannelNotificationToggleButton user={user} channelId={channelId} />
      )}
    </div>
  );
}

interface ChannelNotificationToggleButtonProps {
  user: UserResource;
  channelId: string;
}

function ChannelNotificationToggleButton({
  user,
  channelId,
}: ChannelNotificationToggleButtonProps) {
  const { addNotification } = useChannelActionContext();

  const mutedChannels = user.unsafeMetadata.mutedChannels || [];

  const channelMuted = mutedChannels.includes(channelId);

  async function setChannelMuted(channeId: string, muted: boolean) {
    try {
      

      let mutedChannelsUpdate: string[];

      if (muted) {
        mutedChannelsUpdate = [...mutedChannels, channelId];
      } else {
        mutedChannelsUpdate = mutedChannels.filter((id) => id !== channelId);
      }

      await user.update({
        unsafeMetadata: {
          mutedChannels: mutedChannelsUpdate,
        },
      });

      addNotification(
        `Channel notification ${muted ? "muted" : "unmuted"}`,
        "success"
      );
    } catch (error) {
      console.log(error);
      addNotification("Something went wrong. Please try again.", "error");
    }
  }

  return (
    <div className="me-6">
      {!channelMuted ? (
        <span title="Mute channel notification">
          <BellOff
            className="cursor-pointer"
            onClick={() => setChannelMuted(channelId, true)}
          />
        </span>
      ) : (
        <span title="Unmute Channel notification">
          <Bell
            className="cursor-pointer"
            onClick={() => setChannelMuted(channelId, false)}
          />
        </span>
      )}
    </div>
  );
}
