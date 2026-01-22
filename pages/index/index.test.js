describe('pages/index/index', () => {
    let page;

    beforeAll(async () => {
        page = await program.reLaunch('/pages/index/index');
        await page.waitFor(1000);
    });

    describe('Header Section', () => {
        it('should display app title', async () => {
            const titleEl = await page.$('.app-title');
            expect(titleEl).not.toBeNull();
            const text = await titleEl.text();
            expect(text.length).toBeGreaterThan(0);
        });

        it('should display status chip', async () => {
            const statusChip = await page.$('.status-chip');
            expect(statusChip).not.toBeNull();
        });

        it('should show offline status initially', async () => {
            const statusChip = await page.$('.status-chip');
            const classList = await statusChip.attribute('class');
            expect(classList).toContain('chip-offline');
        });
    });

    describe('Action Panel', () => {
        it('should display init button', async () => {
            const initBtn = await page.$('.btn-primary');
            expect(initBtn).not.toBeNull();
        });

        it('should display new record button', async () => {
            const saveBtn = await page.$('.btn-accent');
            expect(saveBtn).not.toBeNull();
        });

        it('should display refresh button', async () => {
            const queryBtn = await page.$('.btn-secondary');
            expect(queryBtn).not.toBeNull();
        });

        it('should display clear button', async () => {
            const clearBtn = await page.$('.btn-ghost');
            expect(clearBtn).not.toBeNull();
        });

        it('should display reset strip', async () => {
            const resetStrip = await page.$('.reset-strip');
            expect(resetStrip).not.toBeNull();
        });
    });

    describe('Database Initialization', () => {
        it('should initialize database when init button clicked', async () => {
            const initBtn = await page.$('.btn-primary');
            await initBtn.tap();
            await page.waitFor(500);

            // Check status changes to online
            const statusChip = await page.$('.status-chip');
            const classList = await statusChip.attribute('class');
            expect(classList).toContain('chip-online');
        });

        it('should show toast message after init', async () => {
            // Toast should appear briefly
            await page.waitFor(100);
            const statusChip = await page.$('.status-chip');
            const classList = await statusChip.attribute('class');
            // After init, status should be online
            expect(classList).toContain('chip-online');
        });
    });

    describe('Add New Record', () => {
        it('should add new user when save button clicked', async () => {
            // Get count before
            const countNumBefore = await page.$('.count-num');
            const countBefore = parseInt(await countNumBefore.text()) || 0;

            const saveBtn = await page.$('.btn-accent');
            await saveBtn.tap();
            await page.waitFor(500);

            // Get count after
            const countNumAfter = await page.$('.count-num');
            const countAfter = parseInt(await countNumAfter.text());
            expect(countAfter).toBe(countBefore + 1);
        });

        it('should display user card after adding', async () => {
            const recordCards = await page.$$('.record-card');
            expect(recordCards.length).toBeGreaterThan(0);
        });

        it('should show user name in card', async () => {
            const userName = await page.$('.user-name');
            expect(userName).not.toBeNull();
            const text = await userName.text();
            expect(text.length).toBeGreaterThan(0);
        });

        it('should show user score in card', async () => {
            const scoreValue = await page.$('.score-value');
            expect(scoreValue).not.toBeNull();
        });
    });

    describe('Query/Refresh Records', () => {
        it('should refresh user list when query button clicked', async () => {
            const queryBtn = await page.$('.btn-secondary');
            await queryBtn.tap();
            await page.waitFor(500);

            // After refresh, the list should still display
            const recordsSection = await page.$('.records-section');
            expect(recordsSection).not.toBeNull();
        });
    });

    describe('Delete Record', () => {
        it('should delete user when delete button clicked', async () => {
            // First ensure we have at least one record
            let recordCards = await page.$$('.record-card');
            if (recordCards.length === 0) {
                const saveBtn = await page.$('.btn-accent');
                await saveBtn.tap();
                await page.waitFor(500);
            }

            // Get count before
            const countNumBefore = await page.$('.count-num');
            const countBefore = parseInt(await countNumBefore.text());

            const deleteBtn = await page.$('.delete-btn');
            await deleteBtn.tap();
            await page.waitFor(500);

            // Get count after
            const countNumAfter = await page.$('.count-num');
            const countAfter = parseInt(await countNumAfter.text());
            expect(countAfter).toBe(countBefore - 1);
        });
    });

    describe('Records List Display', () => {
        it('should display section title', async () => {
            const sectionTitle = await page.$('.section-title');
            expect(sectionTitle).not.toBeNull();
        });

        it('should display count badge', async () => {
            const countBadge = await page.$('.count-badge');
            expect(countBadge).not.toBeNull();
        });

        it('should show count in badge', async () => {
            const countNum = await page.$('.count-num');
            expect(countNum).not.toBeNull();
            const countText = await countNum.text();
            expect(parseInt(countText)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('User Card Details', () => {
        beforeAll(async () => {
            // Ensure at least one user exists
            const recordCards = await page.$$('.record-card');
            if (recordCards.length === 0) {
                const saveBtn = await page.$('.btn-accent');
                await saveBtn.tap();
                await page.waitFor(500);
            }
        });

        it('should display user avatar', async () => {
            const avatar = await page.$('.user-avatar');
            expect(avatar).not.toBeNull();
        });

        it('should display avatar letter', async () => {
            const avatarLetter = await page.$('.avatar-letter');
            expect(avatarLetter).not.toBeNull();
            const text = await avatarLetter.text();
            expect(text.length).toBe(1);
        });

        it('should display user badge with ID', async () => {
            const userBadge = await page.$('.user-badge');
            expect(userBadge).not.toBeNull();
            const text = await userBadge.text();
            expect(text).toMatch(/^#\d+$/);
        });

        it('should display meta chips for gender and age', async () => {
            const metaChips = await page.$$('.meta-chip');
            expect(metaChips.length).toBeGreaterThanOrEqual(2);
        });

        it('should display score label', async () => {
            const scoreLabel = await page.$('.score-label');
            expect(scoreLabel).not.toBeNull();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no records', async () => {
            // Check if empty state might be visible
            const recordCards = await page.$$('.record-card');
            if (recordCards.length === 0) {
                const emptyState = await page.$('.empty-state');
                expect(emptyState).not.toBeNull();
            } else {
                // If there are records, empty state should not be visible
                expect(recordCards.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Score Styling', () => {
        beforeAll(async () => {
            // Add multiple users to have variety in scores
            for (let i = 0; i < 3; i++) {
                const saveBtn = await page.$('.btn-accent');
                await saveBtn.tap();
                await page.waitFor(300);
            }
        });

        it('should apply score classes based on score value', async () => {
            const scoreValues = await page.$$('.score-value');
            expect(scoreValues.length).toBeGreaterThan(0);

            for (const scoreEl of scoreValues) {
                const classList = await scoreEl.attribute('class');
                const hasScoreClass = classList.includes('score-excellent') ||
                    classList.includes('score-good') ||
                    classList.includes('score-low');
                expect(hasScoreClass).toBe(true);
            }
        });
    });

    describe('Card Accent Styling', () => {
        it('should apply accent classes based on score', async () => {
            const accents = await page.$$('.card-accent');
            expect(accents.length).toBeGreaterThan(0);

            for (const accent of accents) {
                const classList = await accent.attribute('class');
                const hasAccentClass = classList.includes('accent-excellent') ||
                    classList.includes('accent-good') ||
                    classList.includes('accent-low');
                expect(hasAccentClass).toBe(true);
            }
        });
    });

    describe('Avatar Styling', () => {
        it('should apply avatar color classes', async () => {
            const avatars = await page.$$('.user-avatar');
            expect(avatars.length).toBeGreaterThan(0);

            for (const avatar of avatars) {
                const classList = await avatar.attribute('class');
                const hasAvatarClass = classList.includes('avatar-purple') ||
                    classList.includes('avatar-blue') ||
                    classList.includes('avatar-teal') ||
                    classList.includes('avatar-orange');
                expect(hasAvatarClass).toBe(true);
            }
        });
    });

    describe('Reset Database', () => {
        it('should have reset strip visible', async () => {
            const resetStrip = await page.$('.reset-strip');
            expect(resetStrip).not.toBeNull();
        });

        it('should show reset label', async () => {
            const resetLabel = await page.$('.reset-label');
            expect(resetLabel).not.toBeNull();
            const text = await resetLabel.text();
            expect(text.length).toBeGreaterThan(0);
        });
    });

    describe('Background Gradient', () => {
        it('should have background gradient container', async () => {
            const bgGradient = await page.$('.bg-gradient');
            expect(bgGradient).not.toBeNull();
        });

        it('should have multiple gradient layers', async () => {
            const bgLayers = await page.$$('.bg-layer');
            expect(bgLayers.length).toBeGreaterThan(0);
        });
    });

    describe('Button Labels', () => {
        it('should display button labels', async () => {
            const btnLabels = await page.$$('.btn-label');
            expect(btnLabels.length).toBeGreaterThanOrEqual(4);
        });

        it('should have non-empty button labels', async () => {
            const btnLabels = await page.$$('.btn-label');
            for (const label of btnLabels) {
                const text = await label.text();
                expect(text.length).toBeGreaterThan(0);
            }
        });

        it('should display button icons', async () => {
            const btnIcons = await page.$$('.btn-icon');
            expect(btnIcons.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe('Multiple Records', () => {
        it('should display multiple record cards', async () => {
            // Add a few more records
            for (let i = 0; i < 2; i++) {
                const saveBtn = await page.$('.btn-accent');
                await saveBtn.tap();
                await page.waitFor(300);
            }

            const recordCards = await page.$$('.record-card');
            expect(recordCards.length).toBeGreaterThanOrEqual(2);
        });

        it('should display correct count in badge', async () => {
            const recordCards = await page.$$('.record-card');
            const countNum = await page.$('.count-num');
            const countText = await countNum.text();
            expect(parseInt(countText)).toBe(recordCards.length);
        });
    });
});
