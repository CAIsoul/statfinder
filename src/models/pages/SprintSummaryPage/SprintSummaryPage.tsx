import React from 'react';
import { useState } from 'react';
import { Dropdown, Button, Space, Table } from 'antd';

import './SprintSummaryPage.scss';
import { Board, BoardTypeEnum, Issue, Sprint } from '../../JiraData';
import { jira } from '../../../service/JiraDataService';
import { UpperCaseFirstChar } from '../../../service/StringFormatService';

interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const displayIssueColumns = [
        { title: 'Key', dataIndex: 'key', key: 'key' },
        // { title: '', dataIndex: '', key: '' }
    ];

    const boardTypes = Object.entries(BoardTypeEnum).map(entry => ({ key: entry[0], label: UpperCaseFirstChar(entry[1]) }));
    const [boardOptions, setBoardOptions] = useState<Board[]>([]);
    const [sprintOptions, setSprintOptions] = useState<Sprint[]>([]);
    const [issues, setIssues] = useState<Issue[]>([]);

    const [selectedBoardType, setSelectedBoardType] = useState<string>();
    const [selectedBoardId, setSelectedBoardId] = useState<number>();
    const [selectedSprintId, setSelectedSprintId] = useState<number>();

    /**
     * Handle when a board type is selected
     *
     * @param {*} event
     */
    function handleBoardTypeClick(event: any) {
        const { key: boardTypeKey } = event;
        if (boardTypeKey !== selectedBoardType) {
            setSelectedBoardType(boardTypeKey);
            jira.getBoards({ type: boardTypeKey })
                .then((boards: Board[]) => {
                    boards.sort((a, b) => a.name > b.name ? 1 : -1);
                    setBoardOptions(boards);
                    setSelectedBoardId(-1);
                    setSprintOptions([]);
                    setSelectedSprintId(-1);
                });
        }
    }

    /**
     * Handle when a board is selected
     *
     * @param {*} event
     */
    function handleBoardOptionClick(event: any) {
        const boardId = +event.key;
        if (boardId !== selectedBoardId) {
            setSelectedBoardId(boardId);

            jira.getSprintsByBoardId(boardId)
                .then((sprints: Sprint[]) => {
                    sprints.sort((a, b) => a.startDate < b.endDate ? 1 : -1);
                    setSprintOptions(sprints);
                    setSelectedSprintId(-1);
                });
        }
    }

    /**
     * Handle when a sprint is selected
     *
     * @param {*} event
     */
    function handleSprintOptionClick(event: any) {
        const sprintId = +event.key;
        if (sprintId !== selectedSprintId) {
            setSelectedSprintId(sprintId);

            jira.getIssuesBySprintId(sprintId)
                .then((issues: Issue[]) => {
                    setIssues(issues);
                });
        }
    }

    return (<div className='page-container'>
        <Space direction='vertical'>
            <Space wrap>
                <Dropdown
                    menu={{ items: boardTypes, onClick: handleBoardTypeClick }}
                    placement="bottom"
                >
                    <Button>{selectedBoardType && boardTypes.find(t => t.key === selectedBoardType)?.label || "Select board type..."}</Button>
                </Dropdown>
                <Dropdown
                    menu={{ items: boardOptions.map(b => ({ key: b.id, label: b.name })), onClick: handleBoardOptionClick }}
                    placement="bottom"
                >
                    <Button>{selectedBoardId && boardOptions.find(b => b.id === selectedBoardId)?.name || 'Select a board...'}</Button>
                </Dropdown>
                <Dropdown
                    menu={{ items: sprintOptions.map(s => ({ key: s.id, label: s.name })), onClick: handleSprintOptionClick }}
                    placement='bottom'
                >
                    <Button>{selectedSprintId && sprintOptions.find(s => s.id === selectedSprintId)?.name || 'Select a sprint...'}</Button>
                </Dropdown>
            </Space>
            <Space>
                <Table<Issue> columns={displayIssueColumns} dataSource={issues}></Table>
            </Space>
        </Space>
    </div>);
};

export default SprintSummaryPage;