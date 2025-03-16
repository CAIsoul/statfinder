import React from 'react';
import { useState } from 'react';
import { Dropdown, Button, Space } from 'antd';

import './SprintSummaryPage.scss';
import { BoardTypeEnum } from '../../JiraData';
import { jira } from '../../../service/JiraDataService';
import { UpperCaseFirstChar } from '../../../service/StringFormatService';

interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    const boardTypes = Object.entries(BoardTypeEnum).map(entry => ({ key: entry[0], label: UpperCaseFirstChar(entry[1]) }));
    const [boardOptions, setBoardOptions] = useState<any[]>([]);
    const [sprintOptions, setSprintOptions] = useState<any[]>([]);

    const [selectedBoardType, setSelectedBoardType] = useState<string>();
    const [selectedBoardId, setSelectedBoardId] = useState<number>();
    const [selectedSprintId, setSelectedSprintId] = useState<number>();

    function handleBoardTypeClick(event: any) {
        const { key: boardTypeKey } = event;
        if (boardTypeKey !== selectedBoardType) {
            setSelectedBoardType(boardTypeKey);
            jira.getBoards({ type: boardTypeKey })
                .then((boards) => {
                    setBoardOptions(
                        boards.map(b => ({ key: b.id, label: b.name }))
                            .sort((a, b) => a.label > b.label ? 1 : -1)
                    );
                });
        }
    }

    function handleBoardOptionClick(event: any) {
        const boardId = +event.key;
        if (boardId !== selectedBoardId) {
            setSelectedBoardId(boardId);

            jira.getSprintsByBoardId(boardId)
                .then((sprints) => {
                    setSprintOptions(
                        sprints.map(b => ({ key: b.id, label: b.name }))
                            .sort((a, b) => a.label > b.label ? 1 : -1)
                    );
                });
        }
    }

    function handleSprintOptionClick(event: any) {
        const sprintId = +event.key;
        if (sprintId !== selectedSprintId) {
            setSelectedSprintId(sprintId);
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
                    menu={{ items: boardOptions, onClick: handleBoardOptionClick }}
                    placement="bottom"
                >
                    <Button>{selectedBoardId && boardOptions.find(b => b.key === selectedBoardId)?.label || 'Select a board...'}</Button>
                </Dropdown>
                <Dropdown
                    menu={{ items: sprintOptions, onClick: handleSprintOptionClick }}
                    placement='bottom'
                >
                    <Button>{selectedSprintId && sprintOptions.find(s => s.key === selectedSprintId)?.label || 'Select a sprint...'}</Button>
                </Dropdown>
            </Space>
        </Space>
    </div>);
};

export default SprintSummaryPage;