import {useMemo, useState} from "react";
import {Button, Popconfirm, Table} from "antd";
import {useNavigate} from "react-router-dom";
import {formatObject} from "@/utils";
import {useQuery} from "@tanstack/react-query";
import tagService from "@/apis/service/tagService";
import moment from "moment/moment";
import {HiPencilAlt} from "react-icons/hi";
import {BiTrash} from "react-icons/bi";
import toast from "react-hot-toast";

const ListAdminTag = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        page: 0,
        limit: 10,
        q: "",
    });

    const {
        data: listTagData = {
            contents: [],
            totalElements: 0,
        },
        isLoading: listTagLoading,
        refetch: refetchListTag,
    } = useQuery({
        queryKey: ["allAdminTags", searchParams],
        queryFn: async ({queryKey}: any) => {
            const [, searchParams] = queryKey;
            return await tagService.getAll(formatObject(searchParams));
        },
    });

    const {contents: listTags = [], totalElements: totalTags} =
    listTagData || {};

    const listTagsTableData = useMemo(() => {
        if (!listTags) return [];
        return listTags.map((tag: any) => ({
            title: tag?.tagName,
            startTime: moment(tag?.creatdAt).format("YYYY-MM-DD HH:mm"),
            createdBy: tag?.creator,
            status: tag?.status,
            key: tag.id,
            id: tag.id,
        }));
    }, [listTags]);

    const handleDeleteTag = async (id: number) => {
        try {
            await tagService.delete(id);
            await refetchListTag();
            toast.success("Delete tag successfully");
        } catch (error) {
            console.log(error);
            toast.error("Delete tag failed");
        }
    };

    const columns = [
        {
            title: "Tag",
            dataIndex: "title",
            key: "title",
            render: (text: string, record: any) => (
                <div
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => navigate(`/list-problem?tag=${record.id}`)}
                >
                    {text}
                </div>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: any) => (
                <div className={"flex items-center"}>
                    <div
                        className="cursor-pointer hover:text-blue-500"
                        onClick={() => navigate(`/admin/tag/edit/${record.id}`)}
                    >
                        <HiPencilAlt size={20}/>
                    </div>

                    <Popconfirm
                        title="Are you sure to delete this tag?"
                        onConfirm={() => handleDeleteTag(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <BiTrash size={20} className="cursor-pointer hover:text-red-500"/>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full">
            <Button
                type={'primary'}
                className={'mb-3'}
                onClick={() => navigate('/admin/tag/create')}
            >
                Add new tag
            </Button>
            <Table
                dataSource={listTagsTableData}
                columns={columns}
                loading={listTagLoading}
                pagination={{
                    current: searchParams.page + 1,
                    total: totalTags,
                    pageSize: searchParams.limit,
                    onChange: (page) => {
                        setSearchParams({
                            ...searchParams,
                            page: page - 1,
                        });
                    },
                }}
            />
        </div>
    );
};

export default ListAdminTag;
