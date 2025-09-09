import React, { useState, useEffect } from 'react'
import { gql } from '@apollo/client';
import { client } from '../../../graphql/client';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { AuthVar } from '../../Auth/AuthVar';
export default function TaskForm({ editId, open, onClose, rows, onTaskChange }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogInfo, setInfo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [formValues, setFormValues] = useState({ title: '', description: '' });

    useEffect(() => {
        if (open) {
            setDialogOpen(true);
            if (editId) {
                // Prefill form for edit
                const editTask = rows?.find(row => row.id === editId);
                if (editTask) {
                    setFormValues({ title: editTask.title, description: editTask.description });
                }
            } else {
                setFormValues({ title: '', description: '' });
            }
        } else {
            setDialogOpen(false);
        }
    }, [open, editId, rows]);

    const handleClickOpen = () => {
        setDialogOpen(true);
        setFormValues({ title: '', description: '' });
    };

    const handleClose = () => {
        setDialogOpen(false);
        if (onClose) onClose();
    };
    const handleCloseInfo = () => {
        setInfo(false);
        if(onClose) onClose();
    }

    const ADD_TASK = gql`
        mutation AddTask($title: String!, $description: String!, $userId: Float!) {
            addTask(userId: $userId, data: {
                title: $title,
                dueAt: "2025-09-02T09:30:00.000Z",
                description: $description,
                status: IN_PROGRESS,
                tags: ["học bài2"]
            }) {
                id
                title
                description
                dueAt
                status
                tags {
                    title
                }
            }
        }
    `;

    const EDIT_TASK = gql`
        mutation EditTask($id: ID!, $title: String!, $description: String!) {
            editTask(id: $id, data: {
                title: $title,
                description: $description,
            }) {
                id
                title
                description
                dueAt
                status
                tags {
                    title
                }
            }
        }
    `;

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            console.log(AuthVar);
            let data;
            if (editId) {
                // Edit mode
                const res = await client.mutate({
                    mutation: EDIT_TASK,
                    variables: {
                        id: editId,
                        title: formValues.title,
                        description: formValues.description,
                    },
                });
                data = res.data.editTask;
            } else {
                // Add mode
                const res = await client.mutate({
                    mutation: ADD_TASK,
                    variables: {
                        userId: Number(AuthVar.userId),
                        title: formValues.title,
                        description: formValues.description,
                    },
                });
                data = res.data.addTask;
            }
            setResult(data);
            setInfo(true);
            // Notify parent to update the table immediately
            if (onTaskChange) onTaskChange(data, editId);
            handleClose();
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={handleClickOpen}>
                Add new Task +
            </Button>
            <Dialog open={dialogOpen} onClose={handleClose}>
                <DialogTitle>{editId ? 'Edit Task' : 'Add Task'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {editId ? 'Edit your task details' : "Let's Create new task for your journey"}
                    </DialogContentText>
                    <form onSubmit={handleSubmit} id="subscription-form">
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="title"
                            name="title"
                            label="Title"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={formValues.title}
                            onChange={handleChange}
                        />
                        <TextField
                            required
                            margin="dense"
                            id="description"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={formValues.description}
                            onChange={handleChange}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" form="subscription-form" disabled={loading}>
                        {loading ? (editId ? 'Saving...' : 'Submitting...') : (editId ? 'Save' : 'Submit')}
                    </Button>
                </DialogActions>
            </Dialog>
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {result && (
                <Dialog open={dialogInfo} onClose={handleCloseInfo}>
                    <DialogTitle>{editId ? 'Task Updated!' : 'Task Created!'}</DialogTitle>
                    <DialogContent>
                        <div style={{ marginTop: 16 }}>
                            <b>{editId ? 'Task Updated:' : 'Task Created:'}</b>
                            <div>ID: {result.id}</div>
                            <div>Title: {result.title}</div>
                            <div>Description: {result.description}</div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </React.Fragment>
    );
}