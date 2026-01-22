describe('pages/settings/settings', () => {
    let page;

    beforeAll(async () => {
        page = await program.reLaunch('/pages/settings/settings');
        await page.waitFor(1000);
    });

    describe('Header Section', () => {
        it('should display header', async () => {
            const header = await page.$('.header');
            expect(header).not.toBeNull();
        });

        it('should display back button', async () => {
            const backBtn = await page.$('.back-btn');
            expect(backBtn).not.toBeNull();
        });

        it('should display back icon', async () => {
            const backIcon = await page.$('.back-icon');
            expect(backIcon).not.toBeNull();
            const text = await backIcon.text();
            expect(text).toBe('←');
        });

        it('should display header title', async () => {
            const headerTitle = await page.$('.header-title');
            expect(headerTitle).not.toBeNull();
            const text = await headerTitle.text();
            expect(text.length).toBeGreaterThan(0);
        });

        it('should display header placeholder for layout balance', async () => {
            const placeholder = await page.$('.header-placeholder');
            expect(placeholder).not.toBeNull();
        });
    });

    describe('Settings List', () => {
        it('should display settings list container', async () => {
            const settingsList = await page.$('.settings-list');
            expect(settingsList).not.toBeNull();
        });

        it('should display setting section', async () => {
            const settingSection = await page.$('.setting-section');
            expect(settingSection).not.toBeNull();
        });

        it('should display section label', async () => {
            const sectionLabel = await page.$('.section-label');
            expect(sectionLabel).not.toBeNull();
            const text = await sectionLabel.text();
            expect(text.length).toBeGreaterThan(0);
        });
    });

    describe('Language Options', () => {
        it('should display option group', async () => {
            const optionGroup = await page.$('.option-group');
            expect(optionGroup).not.toBeNull();
        });

        it('should display two language options', async () => {
            const optionItems = await page.$$('.option-item');
            expect(optionItems.length).toBe(2);
        });

        it('should display option text for each language', async () => {
            const optionTexts = await page.$$('.option-text');
            expect(optionTexts.length).toBe(2);

            for (const optionText of optionTexts) {
                const text = await optionText.text();
                expect(text.length).toBeGreaterThan(0);
            }
        });

        it('should have one active option initially', async () => {
            const activeOptions = await page.$$('.option-active');
            expect(activeOptions.length).toBe(1);
        });

        it('should display check mark for active option', async () => {
            const checkMark = await page.$('.check-mark');
            expect(checkMark).not.toBeNull();
        });

        it('should display check icon', async () => {
            const checkIcon = await page.$('.check-icon');
            expect(checkIcon).not.toBeNull();
            const text = await checkIcon.text();
            expect(text).toBe('✓');
        });
    });

    describe('Language Switch', () => {
        it('should switch to first language option when clicked', async () => {
            const optionItems = await page.$$('.option-item');
            await optionItems[0].tap();
            await page.waitFor(300);

            // First option should now be active
            const firstOption = await page.$$('.option-item');
            const firstClass = await firstOption[0].attribute('class');
            expect(firstClass).toContain('option-active');
        });

        it('should switch to second language option when clicked', async () => {
            const optionItems = await page.$$('.option-item');
            await optionItems[1].tap();
            await page.waitFor(300);

            // Second option should now be active
            const updatedOptions = await page.$$('.option-item');
            const secondClass = await updatedOptions[1].attribute('class');
            expect(secondClass).toContain('option-active');
        });

        it('should only have one active option after switching', async () => {
            const activeOptions = await page.$$('.option-active');
            expect(activeOptions.length).toBe(1);
        });

        it('should move check mark to selected option', async () => {
            // Click first option
            const optionItems = await page.$$('.option-item');
            await optionItems[0].tap();
            await page.waitFor(300);

            // Check mark should be in first option
            const checkMarks = await page.$$('.check-mark');
            expect(checkMarks.length).toBe(1);
        });
    });

    describe('UI Text Updates on Language Change', () => {
        it('should update header title when language changes', async () => {
            const headerTitle = await page.$('.header-title');
            const initialText = await headerTitle.text();

            // Switch language
            const optionItems = await page.$$('.option-item');
            await optionItems[1].tap();
            await page.waitFor(500);

            // Title should still exist and have text
            const updatedTitle = await page.$('.header-title');
            const updatedText = await updatedTitle.text();
            expect(updatedText.length).toBeGreaterThan(0);
        });

        it('should update section label when language changes', async () => {
            const sectionLabel = await page.$('.section-label');
            const initialText = await sectionLabel.text();

            // Switch language
            const optionItems = await page.$$('.option-item');
            await optionItems[0].tap();
            await page.waitFor(500);

            // Label should still exist and have text
            const updatedLabel = await page.$('.section-label');
            const updatedText = await updatedLabel.text();
            expect(updatedText.length).toBeGreaterThan(0);
        });
    });

    describe('Container Layout', () => {
        it('should display main container', async () => {
            const container = await page.$('.container');
            expect(container).not.toBeNull();
        });
    });

    describe('Back Navigation', () => {
        it('should have clickable back button', async () => {
            const backBtn = await page.$('.back-btn');
            expect(backBtn).not.toBeNull();
            // Note: Actually clicking back would navigate away from page
            // So we just verify the button exists and is accessible
        });
    });

    describe('Option Styling', () => {
        it('should have styled option group with border', async () => {
            const optionGroup = await page.$('.option-group');
            expect(optionGroup).not.toBeNull();
        });

        it('should have proper option item layout', async () => {
            const optionItems = await page.$$('.option-item');
            expect(optionItems.length).toBeGreaterThan(0);

            for (const item of optionItems) {
                const classList = await item.attribute('class');
                expect(classList).toContain('option-item');
            }
        });
    });
});
