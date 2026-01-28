"use client";

import { PageHeader, ThemeSwitcher, useAuth } from "@/shared";
import { Avatar, Button, Card, Flex, Section, Text } from "@radix-ui/themes";
import {
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  Palette,
  ShieldCheck,
  Tags,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const avatarFallback = user?.name
    ?.split(" ")
    .map((name) => name[0])
    .join("");

  // Dummy state for toggles
  const [notifications, setNotifications] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(false);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    action,
    color = "gray",
  }: {
    icon: any;
    label: string;
    description?: string;
    action?: React.ReactNode;
    color?: string;
  }) => (
    <div
      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left group`}
    >
      <Flex gap="4" align="center">
        <Flex
          className={`h-10 w-10 rounded-xl items-center justify-center bg-gray-100 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors shadow-sm`}
        >
          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </Flex>
        <Flex direction="column" gap="0">
          <Text size="2" weight="bold">
            {label}
          </Text>
          {description && (
            <Text size="1" color="gray">
              {description}
            </Text>
          )}
        </Flex>
      </Flex>
      {action ? (
        action
      ) : (
        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Quick Actions Bar */}
      {/* <Flex
        gap="3"
        align="center"
        overflow="auto"
        className="pb-2 scrollbar-hide"
      >
        <Text
          size="1"
          weight="bold"
          color="gray"
          className="whitespace-nowrap mr-2"
        >
          Quick Actions |
        </Text>
        <Button
          variant="soft"
          color="green"
          size="1"
          radius="full"
          className="px-3"
        >
          <Plus size={14} /> Add Income
        </Button>
        <Button
          variant="soft"
          color="red"
          size="1"
          radius="full"
          className="px-3"
        >
          <ArrowDown size={14} /> Add Expense
        </Button>
        <Button
          variant="soft"
          color="blue"
          size="1"
          radius="full"
          className="px-3"
        >
          <RefreshCw size={14} /> Transfer
        </Button>
        <Button
          variant="soft"
          color="orange"
          size="1"
          radius="full"
          className="px-3"
        >
          <Calculator size={14} /> Calculator
        </Button>
        <Button
          variant="soft"
          color="iris"
          size="1"
          radius="full"
          className="px-3"
        >
          <PieChart size={14} /> Reports
        </Button>
      </Flex> */}

      {/* Profile Card */}
      <Card size="3" className="overflow-hidden">
        <Flex justify="between" align="center">
          <Flex gap="4" align="center">
            <Avatar
              size="6"
              radius="full"
              fallback={avatarFallback || "U"}
              className="border-2 border-primary/20"
            />
            <Flex direction="column">
              <Text size="4" weight="bold">
                {user?.name || "User Name"}
              </Text>
              <Text size="2" color="gray">
                {user?.email || "user@example.com"}
              </Text>
              <Text size="1" color="gray" mt="1">
                Member since January 2025
              </Text>
            </Flex>
          </Flex>
          <Button variant="outline" onClick={() => {}}>
            Edit Profile
          </Button>
        </Flex>
      </Card>

      {/* Quick Settings */}
      {/* <div className="space-y-4">
        <Heading size="3" weight="bold">
          Quick Settings
        </Heading>
        <Card size="2">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="center">
              <Flex direction="column">
                <Text size="2" weight="bold">
                  Push Notifications
                </Text>
                <Text size="1" color="gray">
                  Receive alerts for transactions
                </Text>
              </Flex>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                color="green"
              />
            </Flex>

            <Flex justify="between" align="center">
              <Flex direction="column">
                <Text size="2" weight="bold">
                  Email Reports
                </Text>
                <Text size="1" color="gray">
                  Weekly spending summaries
                </Text>
              </Flex>
              <Switch
                checked={emailReports}
                onCheckedChange={setEmailReports}
                color="green"
              />
            </Flex>

            <Flex justify="between" align="center">
              <Flex direction="column">
                <Text size="2" weight="bold">
                  Due Date Reminders
                </Text>
                <Text size="1" color="gray">
                  Get reminded about pending debts
                </Text>
              </Flex>
              <Switch
                checked={reminders}
                onCheckedChange={setReminders}
                color="green"
              />
            </Flex>

            <Flex justify="between" align="center">
              <Flex direction="column">
                <Text size="2" weight="bold">
                  Budget Alerts
                </Text>
                <Text size="1" color="gray">
                  Notify when nearing budget limits
                </Text>
              </Flex>
              <Switch
                checked={budgetAlerts}
                onCheckedChange={setBudgetAlerts}
                color="green"
              />
            </Flex>
          </Flex>
        </Card>
      </div> */}

      {/* Main Settings Sections */}
      <Flex direction="column" gap="6">
        {/* Account Section */}
        <div className="space-y-3">
          <Text
            size="2"
            weight="bold"
            color="gray"
            className="uppercase tracking-wider"
          >
            Account
          </Text>
          <Card size="1" className="p-0 overflow-hidden">
            <Flex direction="column">
              <SettingRow
                icon={User}
                label="Profile Settings"
                description="Update your personal information"
              />
              <SettingRow
                icon={ShieldCheck}
                label="Security"
                description="Password, 2FA, and login activity"
              />
              {/* <SettingRow
                icon={CreditCard}
                label="Payment Methods"
                description="Manage your linked accounts"
              /> */}
            </Flex>
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <Text
            size="2"
            weight="bold"
            color="gray"
            className="uppercase tracking-wider"
          >
            Preferences
          </Text>
          <Card size="1" className="p-0 overflow-hidden">
            <Flex direction="column">
              <SettingRow
                icon={Bell}
                label="Notifications"
                description="Email and push notification settings"
              />
              <SettingRow
                icon={Palette}
                label="Appearance"
                description="Theme and display preferences"
                action={<ThemeSwitcher isTabStyle={true} />}
              />
              <SettingRow
                icon={Globe}
                label="Language & Region"
                description="Currency and date formats"
              />
              <Link href="/categories">
                <SettingRow
                  icon={Tags}
                  label="Categories"
                  description="Manage your transaction categories"
                />
              </Link>
            </Flex>
          </Card>
        </div>

        {/* More Section */}
        {/* <div className="space-y-3">
          <Text
            size="2"
            weight="bold"
            color="gray"
            className="uppercase tracking-wider"
          >
            More
          </Text>
          <Card size="1" className="p-0 overflow-hidden">
            <Flex direction="column">
              <SettingRow
                icon={Smartphone}
                label="Mobile App"
                description="Download our mobile application"
              />
              <SettingRow
                icon={HelpCircle}
                label="Help & Support"
                description="FAQs and contact support"
              />
            </Flex>
          </Card>
        </div> */}
      </Flex>

      {/* Sign Out Footer */}
      <Section size="1" p="0" mt="4">
        <Card
          size="2"
          className="bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900"
        >
          <Flex justify="between" align="center">
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold" color="red">
                Sign Out
              </Text>
              <Text size="1" color="gray">
                Sign out of your account on this device
              </Text>
            </Flex>
            <Button
              variant="solid"
              color="red"
              size="3"
              radius="large"
              onClick={() => logout()}
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </Flex>
        </Card>
      </Section>

      {/* Footer Info */}
      <Flex direction="column" align="center" gap="1" py="4">
        <Text size="1" color="gray">
          Cashly v1.0.0
        </Text>
        <Text size="1" color="gray">
          Made with ❤️ for better financial management
        </Text>
      </Flex>
    </div>
  );
}
