/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

/**
 * VitePress configuration.
 *
 * @link {https://vitepress.dev/reference/site-config}
 * @link {https://emersonbottero.github.io/vitepress-plugin-mermaid/}
 */
export default withMermaid(
  defineConfig({
    title: "Sophia v2 - Healthcare Platform",
    description:
      "AI-powered healthcare management platform with React, TypeScript, and edge deployment",
    themeConfig: {
      // https://vitepress.dev/reference/default-theme-config
      nav: [
        { text: "Home", link: "/" },
        { text: "Getting Started", link: "/getting-started" },
        { text: "Healthcare Features", link: "/healthcare-features" },
        { text: "AI Agents", link: "/ai-agents" },
        { text: "Architecture", link: "/architecture-design" },
      ],

      sidebar: [
        {
          text: "🚀 Getting Started",
          items: [
            { text: "Quick Start", link: "/getting-started" },
            { text: "Project Overview", link: "/project-overview" },
            { text: "Development Setup", link: "/development-setup" },
          ],
        },
        {
          text: "🏥 Healthcare Platform",
          items: [
            { text: "Healthcare Features", link: "/healthcare-features" },
          ],
        },
        {
          text: "🤖 AI Agents",
          items: [
            { text: "AI Agents Overview", link: "/ai-agents" },
            { text: "Genesis Agent", link: "/genesis-agent" },
            { text: "Sophia Patient Agent", link: "/sophia-patient-agent" },
            { text: "Compliance Agent", link: "/compliance-agent" },
            { text: "Quantum Analytics", link: "/quantum-agent" },
          ],
        },
        {
          text: "📋 Care Plans & Workflows",
          items: [
            { text: "Care Plan Management", link: "/care-plan-management" },
            { text: "Patient Management", link: "/patient-management" },
            { text: "Surgical Workflows", link: "/surgical-workflows" },
            { text: "Task Management", link: "/task-management" },
          ],
        },
        {
          text: "🏗️ Architecture & Design",
          items: [
            { text: "System Architecture", link: "/architecture-design" },
            { text: "Database Schema", link: "/database-schema" },
            { text: "Technology Stack", link: "/technology-stack" },
          ],
        },
        {
          text: "🎨 UI & Components",
          items: [
            { text: "Component Library", link: "/ui-components" },
            { text: "Icon Guidelines", link: "/icon-guidelines" },
            { text: "App Documentation", link: "/app-documentation" },
          ],
        },
        {
          text: "🚢 Deployment & Operations",
          items: [
            { text: "Deployment Guide", link: "/deployment" },
            { text: "Deployment Setup", link: "/deployment-setup" },
          ],
        },
        {
          text: "🔧 Developer Reference",
          items: [
            { text: "Quick Commands", link: "/developer-reference" },
            { text: "Troubleshooting", link: "/troubleshooting" },
          ],
        },
      ],

      socialLinks: [
        {
          icon: "discord",
          link: "https://discord.gg/2nKEnKq",
        },
        {
          icon: "github",
          link: "https://github.com/kriasoft/react-starter-kit",
        },
      ],
    },
  }),
);
