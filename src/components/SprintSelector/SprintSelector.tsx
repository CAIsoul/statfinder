import React, { useState } from 'react';
import { Select, Dropdown, Button, Space } from 'antd';

import './SprintSelector.scss';

import { Board, BoardTypeEnum, Sprint } from '../../models/JiraData';
import { jira } from '../../service/JIRA/JiraDataService';
import { UpperCaseFirstChar } from '../../service/StringFormatService';

interface SelectorProp {
    onSprintSelect: any,
    singleSelect: boolean,
};

const SprintSelector: React.FC<SelectorProp> = ({ onSprintSelect, singleSelect = true }) => {
    /**
   * Handle when a board type is selected
   *
   * @param {*} event
   */
    function onBoardTypeChange(event: any) {
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
     * @param {number} value board id
     */
    function onBoardOptionChange(value: number) {
        const boardId = value;
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
    function onSingleSprintOptionChange(event: any) {
        const sprintId = +event.key;
        if (sprintId !== selectedSprintId) {
            setSelectedSprintId(sprintId);
            onSprintSelect(sprintId);
        }
    }

    function onMultiSprintChange(value: number) {
        console.log(value);
    }

    const boardTypes = Object.entries(BoardTypeEnum).map(entry => ({ key: entry[0], label: UpperCaseFirstChar(entry[1]) }));
    const [boardOptions, setBoardOptions] = useState<Board[]>([]);
    const [sprintOptions, setSprintOptions] = useState<Sprint[]>([]);

    const [selectedBoardType, setSelectedBoardType] = useState<string>();
    const [selectedBoardId, setSelectedBoardId] = useState<number>();
    const [selectedSprintId, setSelectedSprintId] = useState<number>();

    return (
        <Space direction='vertical'>
            <Space wrap>
                <Dropdown
                    menu={{ items: boardTypes, onClick: onBoardTypeChange }}
                    placement="bottom"
                >
                    <Button>{selectedBoardType && boardTypes.find(t => t.key === selectedBoardType)?.label || "Select board type..."}</Button>
                </Dropdown>
                <Select
                    showSearch
                    placeholder="Select a board"
                    optionFilterProp="label"
                    style={{ width: 150 }}
                    onChange={onBoardOptionChange}
                    options={boardOptions.map(b => ({ value: b.id, label: b.name }))}
                />
                {
                    singleSelect && <Dropdown
                        menu={{ items: sprintOptions.map(s => ({ key: s.id, label: s.name })), onClick: onSingleSprintOptionChange }}
                        placement='bottom'
                    >
                        <Button>{selectedSprintId && sprintOptions.find(s => s.id === selectedSprintId)?.name || 'Select a sprint...'}</Button>
                    </Dropdown>}
                {
                    !singleSelect && <Select
                        showSearch
                        mode="multiple"
                        placeholder="Select sprints..."
                        optionFilterProp="label"
                        style={{ width: 600 }}
                        onChange={onMultiSprintChange}
                        options={sprintOptions.map(s => ({ value: s.id, label: s.name }))}
                    />
                }
            </Space>
        </Space>
    );
};

export default SprintSelector;