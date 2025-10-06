import React from "react";
import { Button, toaster, Message } from "rsuite";
import { auth, database } from "../../misc/firebase.config";
import { ref, remove } from "firebase/database";

const RoomItem = ({ room }) => {
  const isOwner = room.createdBy === auth.currentUser.uid;

  const copyLink = () => {
    const link = `${window.location.origin}/room/${room.id}`;
    navigator.clipboard.writeText(link);
    toaster.push(<Message type="info">Link copied!</Message>);
  };

  const deleteRoom = async () => {
    if (!isOwner) {
      toaster.push(<Message type="error">Only owner can delete!</Message>);
      return;
    }

    try {
      await remove(ref(database, `rooms/${room.id}`));
      toaster.push(<Message type="success">Room deleted!</Message>);
    } catch (err) {
      toaster.push(<Message type="error">{err.message}</Message>);
    }
  };

  return (
    <div className="room-item p-2" style={{ borderBottom: "1px solid #eee" }}>
      <div style={{ marginBottom: "4px" }}>
        <span style={{ fontSize: "28px", fontWeight: "600" }}>{room.name}</span>
      </div>
      <div style={{ fontSize: "18px", color: "#666", marginBottom: "8px" }}>
        {room.description || "No description provided."}
      </div>
      <div className="d-flex justify-content-end">
        <Button size="xs" color="blue" appearance="ghost" onClick={copyLink}>
          Copy Link
        </Button>
        {isOwner && (
          <Button size="xs" color="red" appearance="ghost" onClick={deleteRoom} style={{ marginLeft: "8px" }}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default RoomItem;
