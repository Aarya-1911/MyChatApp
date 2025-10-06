import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader, Nav } from "rsuite";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../misc/firebase.config";
import RoomItem from "./RoomItem";

const ChatRoomList = ({ aboveElHeight }) => {
  const [rooms, setRooms] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const roomsRef = ref(database, "rooms");

    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter rooms created by logged-in user
        const filteredRooms = Object.entries(data)
          .filter(([key, room]) => room.createdBy === auth.currentUser.uid)
          .map(([key, room]) => ({ id: key, ...room }));
        setRooms(filteredRooms);
      } else {
        setRooms([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Nav
      appearance="subtle"
      vertical
      reversed
      className="overflow-y-scroll custom-scroll"
      style={{
        height: `calc(100% - ${aboveElHeight}px)`,
      }}
      activeKey={location.pathname}
    >
      {!rooms && (
        <Loader center vertical content="Loading" speed="slow" size="md" />
      )}
      {rooms &&
        rooms.length > 0 &&
        rooms.map((room) => (
          <Nav.Item eventKey={`/chat/${room.id}`} key={room.id}>
            <Link style={{ textDecoration: "none" }} to={`/chat/${room.id}`}>
              <RoomItem room={room} />
            </Link>
          </Nav.Item>
        ))}
    </Nav>
  );
};

export default ChatRoomList;
