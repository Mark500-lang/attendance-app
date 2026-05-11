import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './common/BottomNav';
import './Layout.css';

/**
 * Layout wraps every protected page.
 *
 * Before: Layout managed sidebar open/closed state and passed
 *         toggleSidebar down via Outlet context.
 *
 * Now:    BottomNav is always visible at the bottom.
 *         No sidebar state needed. No context needed for toggling.
 *         Each page header's left icon navigates to /profile directly.
 *
 * The .layout-root takes full height and the page content sits
 * above the bottom nav via padding-bottom set in BottomNav.css.
 */
const Layout = () => {
    return (
        <div className="layout-root">
            {/* Page content renders here */}
            <main className="layout-main">
                <Outlet />
            </main>

            {/* Fixed bottom navigation */}
            <BottomNav />
        </div>
    );
};

export default Layout;