import React from 'react';
import { useState } from 'react';
import { Dropdown, Button, Space } from 'antd';

import './SprintSummaryPage.scss';
import { Board } from '../../JiraData';
import { jira } from '../../../service/JiraDataService';

interface PageProp { };

const SprintSummaryPage: React.FC<PageProp> = () => {
    let cachedBoard: Board[];

    const [boardOptions, setBoardOptions] = useState<any>([]);
    // const [boardSelectionId, setBoardSelectionId] = useState(-1);

    async function onBoardDropdownToggle(state: boolean) {
        if (state) {
            if (cachedBoard === undefined) {
                cachedBoard = await jira.getBoards();
                setBoardOptions(cachedBoard.map(b => ({ key: b.id, label: b.name })));
            }
        }
    }

    function handleBoardOptionClick() {

    }

    return (<div className='page-container'>
        <Space direction='vertical'>
            <Space wrap>
                <Dropdown
                    menu={{ items: boardOptions, onClick: handleBoardOptionClick }}
                    placement="bottom"
                    onOpenChange={onBoardDropdownToggle}
                >
                    <Button>Select a board...</Button>
                </Dropdown>
            </Space>
        </Space>
    </div>);
};

export default SprintSummaryPage;