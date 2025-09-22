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
export default function TagForm({ onCreate }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [formValues, setFormValues] = useState({ title: '', description: '' });

    const POST_TAGS = gql`
        mutation AddTag($title: String!, $description: String!) {
            addTag(data: {
                title: $title,
                description: $description,
            }) {
                id
                title
                description
            }
        }
    `;

    function handleClickOpen() {
        setDialogOpen(true);
        setFormValues({ title: '', description: '' });
        setResult(null);
        setError(null);
    }

    function handleClose() {
        setDialogOpen(false);
    }

    function handleChange(e) {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let res = await client.mutate({
                mutation: POST_TAGS,
                variables: {
                    title: formValues.title,
                    description: formValues.description
                }
            });
            let data = res.data.addTag;
            setResult(data);
            setDialogOpen(false);
            if (onCreate) onCreate(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mb-4">
            <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
                sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 2 }}
            >
                Add new Tag +
            </Button>
            <Dialog open={dialogOpen} onClose={handleClose} PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: '#4f46e5' }}>Add Tag</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, color: '#6366f1' }}>
                        Let's Create new tag for your journey
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
                            variant="outlined"
                            value={formValues.title}
                            onChange={handleChange}
                            sx={{ mb: 2, borderRadius: 2 }}
                        />
                        <TextField
                            required
                            margin="dense"
                            id="description"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formValues.description}
                            onChange={handleChange}
                            sx={{ mb: 2, borderRadius: 2 }}
                        />
                    </form>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
                    <Button onClick={handleClose} color="secondary" variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button type="submit" form="subscription-form" disabled={loading} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>
            {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
            {result && (
                <div className="mt-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                    <b className="text-indigo-700">Tag Created</b>
                    <div>ID: {result.id}</div>
                    <div>Title: {result.title}</div>
                    <div>Description: {result.description}</div>
                </div>
            )}
        </div>
    );
}