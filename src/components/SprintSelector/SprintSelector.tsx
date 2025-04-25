import React, { useState } from 'react';
import { Select, Dropdown, Button, Space } from 'antd';

import './SprintSelector.scss';

import { Board, BoardTypeEnum, Sprint } from '../../models/JiraData';
import { jiraQuery } from '../../service/JIRA/JiraDataQueryService';
import { UpperCaseFirstChar } from '../../service/StringFormatService';
import config from '../../../config';

interface SelectorProp {
    onSprintSelect: (boardId: number, sprints: Sprint[]) => void,
    enableMultiple: boolean,
};

const mockSelection = {
    type: BoardTypeEnum.SCRUM,
    boardId: 99,
    sprintId: 2468
}

const DEFAULT_BOARDTYPE = config.debug ? mockSelection.type : BoardTypeEnum.SCRUM;
const DEFAULT_BOARDID = config.debug ? mockSelection.boardId : 0;
const DEFAULT_SPRINTIDS = config.debug ? [mockSelection.sprintId] : [];

const DEFAULT_TEAMS = [
    'TFSH3'
];

const SprintSelector: React.FC<SelectorProp> = ({ onSprintSelect, enableMultiple = false }) => {
    const boardTypes = Object.entries(BoardTypeEnum).map(entry => ({ key: entry[0], label: UpperCaseFirstChar(entry[1]) }));
    const [boardOptions, setBoardOptions] = useState<Board[]>([]);
    const [sprintOptions, setSprintOptions] = useState<Sprint[]>([]);
    const teamOptions = DEFAULT_TEAMS.slice();

    const [selectedBoardType, setSelectedBoardType] = useState<string>(DEFAULT_BOARDTYPE);
    const [selectedBoardId, setSelectedBoardId] = useState<number>(DEFAULT_BOARDID);
    const [selectedSprintIds, setSelectedSprintIds] = useState<number[]>(DEFAULT_SPRINTIDS);
    const [selectedTeam, setSelectedTeam] = useState<string>(DEFAULT_TEAMS[0]);

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

            let sprints: Sprint[] = await jiraQuery.getSprintsByBoardId(boardId);
            sprints.sort((a, b) => a.startDate < b.startDate ? 1 : -1);

            setSprintOptions(sprints);
            setSelectedSprintIds([]);
        }
    }

    /**
     * Handle when a sprint is selected
     *
     * @param {number} value
     */
    function onSingleSprintChange(value: number) {
        const sprintId = value;
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

    function onTeamChange(event: any) {
        const { key: teamKey } = event;
        if (teamKey !== selectedTeam) {
            setSelectedTeam(teamKey);
        }
    }
    /**
     * Handle when apply button is clicked
     *
     */
    function onApplyClick() {
        let selectedSprints = sprintOptions.filter((s: Sprint) => selectedSprintIds.includes(s.id));

        onSprintSelect(selectedBoardId, selectedSprints);
    }

    return (
        <Space direction='vertical'>
            <Space wrap>
                <Dropdown
                    menu={{ items: teamOptions.map(t => ({ label: t, key: t })), onClick: onTeamChange }}
                    placement="bottom"
                >
                    <Button>{selectedTeam || "Select team..."}</Button>
                </Dropdown>
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
                    !enableMultiple && <Select
                        showSearch
                        placeholder="Select sprints..."
                        optionFilterProp="label"
                        style={{ width: 200 }}
                        onChange={onSingleSprintChange}
                        options={sprintOptions.filter(s => !selectedTeam || s.name.includes(selectedTeam)).map(s => ({ value: s.id, label: s.name }))}
                    />
                }
            </Space>
            <Space wrap>
                {
                    enableMultiple && <Select
                        showSearch
                        mode="multiple"
                        placeholder="Select sprints..."
                        optionFilterProp="label"
                        style={{ width: 600 }}
                        onChange={onMultiSprintChange}
                        options={sprintOptions.filter(s => !selectedTeam || s.name.includes(selectedTeam)).map(s => ({ value: s.id, label: s.name }))}
                    />
                }
                <Button color='primary' variant='solid' onClick={onApplyClick}>Apply</Button>
            </Space>
        </Space>
    );
};

export default SprintSelector;