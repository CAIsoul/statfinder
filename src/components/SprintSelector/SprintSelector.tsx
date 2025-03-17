import React, { useState } from 'react';
import { Select, Dropdown, Button, Space } from 'antd';

import './SprintSelector.scss';

import { Board, BoardTypeEnum, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { UpperCaseFirstChar } from '../../service/StringFormatService';

interface SelectorProp {
    onSprintSelect: any,
    enableMultiple: boolean,
};

const SprintSelector: React.FC<SelectorProp> = ({ onSprintSelect, enableMultiple = false }) => {
    const boardTypes = Object.entries(BoardTypeEnum).map(entry => ({ key: entry[0], label: UpperCaseFirstChar(entry[1]) }));
    const [boardOptions, setBoardOptions] = useState<Board[]>([]);
    const [sprintOptions, setSprintOptions] = useState<Sprint[]>([]);

    const [selectedBoardType, setSelectedBoardType] = useState<string>();
    const [selectedBoardId, setSelectedBoardId] = useState<number>();
    const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>([]);

    /**
     * Handle when a board type is selected
     *
     * @param {*} event
     */
    async function onBoardTypeChange(event: any) {
        const { key: boardTypeKey } = event;
        if (boardTypeKey !== selectedBoardType) {
            setSelectedBoardType(boardTypeKey);

            const boards: Board[] = await jiraQuery.getBoards({ type: boardTypeKey });
            boards.sort((a, b) => a.name > b.name ? 1 : -1);
            setBoardOptions(boards);
            setSelectedBoardId(-1);
            setSprintOptions([]);
            setSelectedSprintIds([]);
        }
    }

    /**
     * Handle when a board is selected
     *
     * @param {number} value board id
     */
    async function onBoardChange(value: number) {
        const boardId = value;
        if (boardId !== selectedBoardId) {
            setSelectedBoardId(boardId);

            const sprints: Sprint[] = await jiraQuery.getSprintsByBoardId(boardId);
            sprints.sort((a, b) => a.startDate < b.endDate ? 1 : -1);
            setSprintOptions(sprints);
            setSelectedSprintIds([]);
        }
    }

    /**
     * Handle when a sprint is selected
     *
     * @param {*} event
     */
    function onSingleSprintChange(event: any) {
        const sprintId = +event.key;
        if (sprintId !== selectedSprintIds[0]) {
            setSelectedSprintIds([sprintId]);
        }
    }

    /**
     * Handle when sprint selection is changed.
     *
     * @param {number[]} values
     */
    function onMultiSprintChange(values: number[]) {
        setSelectedSprintIds(values);
    }

    /**
     * Handle when apply button is clicked
     *
     */
    function onApplyClick() {
        const selectedSprints = sprintOptions.filter((s: Sprint) => selectedSprintIds.includes(s.id));
        onSprintSelect(selectedSprints);
    }

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
                    onChange={onBoardChange}
                    options={boardOptions.map(b => ({ value: b.id, label: b.name }))}
                />
                {
                    !enableMultiple && <Dropdown
                        menu={{ items: sprintOptions.map(s => ({ key: s.id, label: s.name })), onClick: onSingleSprintChange }}
                        placement='bottom'
                    >
                        <Button>{selectedSprintIds[0] && sprintOptions.find(s => s.id === selectedSprintIds[0])?.name || 'Select a sprint...'}</Button>
                    </Dropdown>}
                {
                    enableMultiple && <Select
                        showSearch
                        mode="multiple"
                        placeholder="Select sprints..."
                        optionFilterProp="label"
                        style={{ width: 600 }}
                        onChange={onMultiSprintChange}
                        options={sprintOptions.map(s => ({ value: s.id, label: s.name }))}
                    />
                }
                <Button color='primary' variant='solid' onClick={onApplyClick}>Apply</Button>
            </Space>
        </Space>
    );
};

export default SprintSelector;