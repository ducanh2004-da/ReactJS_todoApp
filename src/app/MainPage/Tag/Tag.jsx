import { useState, useEffect } from "react"
import { gql } from "@apollo/client";
import { client } from "../../../configs/client.config";
import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";
import TagForm from "./TagForm";
export default function Tag() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const GET_TAGS = gql`
        query {
            tags {
                id
                title
                description
            }
        }
    `;
    const DELETE_TAGS = gql`
        mutation DeleteTag($id: Float!) {
            deleteTag(id: $id) {
                id
                title
                description
            }
        }
    `;

    // Fetch tags only once on mount
    useEffect(() => {
        client
            .query({ query: GET_TAGS })
            .then(({ data }) => {
                setRows(data.tags);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    const handleCreate = (newTag) => {
        setRows(prevRows => [...prevRows, newTag]);
    };

    const handleDelete = async (id) => {
        try {
            const res = await client.mutate({
                mutation: DELETE_TAGS,
                variables: { id: Number(id) }
            });
            const deleted = res.data.deleteTag;
            if (deleted && deleted.id) {
                setRows(prevRows => prevRows.filter(row => row.id !== deleted.id));
            }
        } catch (err) {
            setError(err);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Title', width: 300 },
        { field: 'description', headerName: 'Description', width: 500 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div>
                    <button
                        style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];
    const paginationModel = { page: 0, pageSize: 5 };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Tags</h2>
            {loading && <p className="text-gray-500">Loading....</p>}
            {error && <p className="text-red-500">Error : {error.message}</p>}
            <div className="mb-6">
                <TagForm onCreate={handleCreate} />
            </div>
            <b className="block text-left text-lg text-indigo-600 mb-2">List of Tags:</b>
            <Paper sx={{ height: 400, width: '100%', borderRadius: '1rem', boxShadow: 3 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    sx={{ border: 0, fontSize: 16, backgroundColor: 'white', borderRadius: '1rem' }}
                />
            </Paper>
        </div>
    );
}