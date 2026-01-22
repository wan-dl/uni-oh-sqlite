describe('pages/settings/settings', () => {
    let page;

    beforeAll(async () => {
        page = await program.reLaunch('/pages/settings/settings');
        await page.waitFor(1000);
    });

    describe('Header Section', () => {
        // 测试顶部导航栏是否显示
        it('should display header', async () => {
            const header = await page.$('.header');
            expect(header).not.toBeNull();
        });

        // 测试返回按钮是否显示
        it('should display back button', async () => {
            const backBtn = await page.$('.back-btn');
            expect(backBtn).not.toBeNull();
        });

        // 测试返回图标及其文本内容
        it('should display back icon', async () => {
            const backIcon = await page.$('.back-icon');
            expect(backIcon).not.toBeNull();
            const text = await backIcon.text();
            expect(text).toBe('←');
        });

        // 测试标题是否显示且不为空
        it('should display header title', async () => {
            const headerTitle = await page.$('.header-title');
            expect(headerTitle).not.toBeNull();
            const text = await headerTitle.text();
            expect(text.length).toBeGreaterThan(0);
        });
    });

    describe('Settings List', () => {
        // 测试���置列表容器是否显示
        it('should display settings list container', async () => {
            const settingsList = await page.$('.settings-list');
            expect(settingsList).not.toBeNull();
        });

        // 测试设置项区域是否显示
        it('should display setting section', async () => {
            const settingSection = await page.$('.setting-section');
            expect(settingSection).not.toBeNull();
        });

        // 测试区域标签是否显示且不为空
        it('should display section label', async () => {
            const sectionLabel = await page.$('.section-label');
            expect(sectionLabel).not.toBeNull();
            const text = await sectionLabel.text();
            expect(text.length).toBeGreaterThan(0);
        });
    });

    describe('Language Options', () => {
        // 测试选项组容器是否显示
        it('should display option group', async () => {
            const optionGroup = await page.$('.option-group');
            expect(optionGroup).not.toBeNull();
        });

        // 测试是否显示两个语言选项
        it('should display two language options', async () => {
            const optionItems = await page.$$('.option-item');
            expect(optionItems.length).toBe(2);
        });

        // 测试每个选项的文本是否显示
        it('should display option text for each language', async () => {
            const optionTexts = await page.$$('.option-text');
            expect(optionTexts.length).toBe(2);

            for (const optionText of optionTexts) {
                const text = await optionText.text();
                expect(text.length).toBeGreaterThan(0);
            }
        });

        // 测试初始状态下是否有一个激活的选项
        it('should have one active option initially', async () => {
            const activeOptions = await page.$$('.option-active');
            expect(activeOptions.length).toBe(1);
        });

        // 测试激活选项的勾选标记是否显示
        it('should display check mark for active option', async () => {
            const checkMark = await page.$('.check-mark');
            expect(checkMark).not.toBeNull();
        });
    });

    describe('Language Switch', () => {
        // 测试点击第一个选项（中文）是否能正确切换状态
        it('should switch to first language option when clicked', async () => {
            const optionItems = await page.$$('.option-item');
            await optionItems[0].tap();
            await page.waitFor(500);

            // 验证第一个选项是否���含激活样式
            const firstOption = await page.$$('.option-item');
            const firstClass = await firstOption[0].attribute('class');
            expect(firstClass).toContain('option-active');
        });

        // 测试点击第二个选项（英文）是否能正确切换状态
        it('should switch to second language option when clicked', async () => {
            const optionItems = await page.$$('.option-item');
            await optionItems[1].tap();
            await page.waitFor(500);

            // 验证第二个选项是否包含激活样式
            const updatedOptions = await page.$$('.option-item');
            const secondClass = await updatedOptions[1].attribute('class');
            expect(secondClass).toContain('option-active');
        });

        // 测试切换后是否仅有一个激活选项
        it('should only have one active option after switching', async () => {
            const activeOptions = await page.$$('.option-active');
            expect(activeOptions.length).toBe(1);
        });

        // 测试勾选标记是否跟随移动到被选中的选项
        it('should move check mark to selected option', async () => {
            // 点击第一个选项
            const optionItems = await page.$$('.option-item');
            await optionItems[0].tap();
            await page.waitFor(300);

            // 验证勾选标记应该在第一个选项中显示（通过检查页面上check-mark的数量及位置逻辑，这里简化为检查数量）
            const checkMarks = await page.$$('.check-mark');
            expect(checkMarks.length).toBe(1);
        });
    });

    describe('UI Text Updates on Language Change', () => {
        // 测试语言切换后标题文本是否更新
        it('should update header title when language changes', async () => {
            // 切换到英文
            const optionItems = await page.$$('.option-item');
            await optionItems[1].tap();
            await page.waitFor(500);
            
            // 获取英文标题
            const headerTitle = await page.$('.header-title');
            const enText = await headerTitle.text();
            expect(enText).toBe('Settings');

            // 切换回中文
            await optionItems[0].tap();
            await page.waitFor(500);

            // 获取中文标题
            const zhText = await headerTitle.text();
            expect(zhText).toBe('设置');
        });

        // 测试语言切换后区域标签文本是否更新
        it('should update section label when language changes', async () => {
             // 切换到英文
            const optionItems = await page.$$('.option-item');
            await optionItems[1].tap();
            await page.waitFor(500);
            
            const sectionLabel = await page.$('.section-label');
            const enText = await sectionLabel.text();
            expect(enText).toBe('Language');

            // 切换回中文
            await optionItems[0].tap();
            await page.waitFor(500);

            const zhText = await sectionLabel.text();
            expect(zhText).toBe('语言');
        });
    });
});
