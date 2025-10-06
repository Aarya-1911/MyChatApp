import React, { useCallback, useRef, useState } from "react";
import { Button, Form, Input, Message, Modal, Schema, toaster } from "rsuite";
import CreativeIcon from "@rsuite/icons/Creative";
import { useModalState } from "../misc/custom-hooks";
import { serverTimestamp, ref, push } from "firebase/database";
import { database, auth } from "../misc/firebase.config";

const Textarea = React.forwardRef((props, ref) => (
  <Input {...props} as="textarea" ref={ref} />
));

const { StringType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired("Chat name is required"),
  description: StringType().isRequired("Description is required"),
});

const INITIAL_FORM = {
  name: "",
  description: "",
};

const CreateRoomBtnModal = () => {
  const { isOpen, open, close } = useModalState();

  const [formValue, setFormValue] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const onFormChange = useCallback((value) => setFormValue(value), []);

  const onSubmit = async () => {
    if (!formRef.current.check()) return;

    setIsLoading(true);

    const newRoomData = {
      ...formValue,
      createdAt: serverTimestamp(),
      admins: { [auth.currentUser.uid]: true },
      fcmUsers: { [auth.currentUser.uid]: true },
      createdBy: auth.currentUser.uid,
    };

    try {
      const roomRef = await push(ref(database, "rooms"), newRoomData);
      const roomId = roomRef.key;

      // Copy shareable link immediately
      const shareableLink = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(shareableLink);

      toaster.push(
        <Message type="info" closable duration={5000}>
          {`${formValue.name} created! Shareable link copied.`}
        </Message>
      );

      setIsLoading(false);
      setFormValue(INITIAL_FORM);
      close();
    } catch (error) {
      setIsLoading(false);
      toaster.push(
        <Message type="error" closable duration={4000}>
          {error.message}
        </Message>
      );
    }
  };

  return (
    <div className="mt-1">
      <Button block color="green" appearance="primary" onClick={open}>
        <CreativeIcon /> Create new chat room
      </Button>

      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>New chat room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            onChange={onFormChange}
            formValue={formValue}
            model={model}
            ref={formRef}
          >
            <Form.Group controlId="name">
              <Form.ControlLabel>Room name</Form.ControlLabel>
              <Form.Control
                name="name"
                placeholder="Enter chat room name..."
              />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Form.Control
                rows={5}
                name="description"
                accepter={Textarea}
                placeholder="Enter room description..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            block
            appearance="primary"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Create new chat room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
